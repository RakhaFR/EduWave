<?php

namespace App\Services;

use RuntimeException;
use Smalot\PdfParser\Parser;

class PdfQuestionParser
{
    /**
     * Parse raw text extracted from PDF into structured multiple choice questions.
     *
     * Format expected:
     * 1. Pertanyaan...
     * A. Pilihan A
     * B. Pilihan B
     * C. Pilihan C
     * D. Pilihan D
     * Kunci: A (atau Jawaban: A)
     * Pembahasan: Penjelasan optional...
     * Poin: 10 (optional)
     *
     * @param  string  $pdfContent  Raw binary content of the PDF file or file path
     * @return array Array of parsed questions
     *
     * @throws RuntimeException If PDF reading fails or the document format is invalid.
     */
    public function parsePdf(string $pdfContent): array
    {
        $parser = new Parser;
        $pdf = $parser->parseContent($pdfContent);
        $text = $pdf->getText();

        return $this->parseText($text);
    }

    /**
     * Parse raw text into structured multiple-choice questions.
     */
    public function parseText(string $text): array
    {
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        $text = str_replace("\xC2\xA0", ' ', $text);

        $lines = explode("\n", $text);
        $blocks = [];
        $currentBlock = [];

        foreach ($lines as $line) {
            $trimmed = trim($line);
            if (empty($trimmed)) {
                continue;
            }

            if (preg_match('/^(?:Soal\s*)?\d+[\.\)\:\-]\s+/i', $trimmed) && ! empty($currentBlock)) {
                $blocks[] = implode("\n", $currentBlock);
                $currentBlock = [];
            }
            $currentBlock[] = $trimmed;
        }

        if (! empty($currentBlock)) {
            $blocks[] = implode("\n", $currentBlock);
        }

        $questions = [];

        foreach ($blocks as $index => $block) {
            $parsed = $this->parseSingleBlock($block);
            if (! $parsed) {
                throw new RuntimeException('Format soal nomor '.($index + 1).' tidak valid. Setiap soal harus memiliki pertanyaan, minimal dua pilihan, dan Kunci.');
            }

            $questions[] = $parsed;
        }

        if (empty($questions)) {
            throw new RuntimeException('Tidak ada soal pilihan ganda yang ditemukan dalam dokumen PDF.');
        }

        return $questions;
    }

    /**
     * Parse a single block text into a question structure.
     */
    protected function parseSingleBlock(string $block): ?array
    {
        $lines = explode("\n", $block);
        if (empty($lines)) {
            return null;
        }

        $questionText = '';
        $options = [];
        $correctAnswer = null;
        $explanation = null;
        $points = 10; // Default points

        $currentSection = 'question';

        foreach ($lines as $line) {
            $trimmed = trim($line);

            if (preg_match('/^(?:Kunci(?:\s+Jawaban)?|Jawaban(?:\s+Benar)?)[\:\=]\s*([A-E])/i', $trimmed, $matches)) {
                $correctAnswer = strtoupper($matches[1]);
                $currentSection = 'meta';

                continue;
            }

            if (preg_match('/^(?:Pembahasan|Penjelasan)[\:\=]\s*(.*)/i', $trimmed, $matches)) {
                $explanation = trim($matches[1]);
                $currentSection = 'explanation';

                continue;
            }

            if (preg_match('/^(?:Poin|Nilai|Bobot)[\:\=]\s*(\d+)/i', $trimmed, $matches)) {
                $points = (int) $matches[1];
                $currentSection = 'meta';

                continue;
            }

            if (preg_match('/^([A-Ea-e])[\.\)\:\-]\s+(.*)/', $trimmed, $matches)) {
                $optKey = strtoupper($matches[1]);
                $optVal = trim($matches[2]);
                $options[$optKey] = $optVal;
                $currentSection = 'option';

                continue;
            }

            if ($currentSection === 'question') {
                if (empty($questionText)) {
                    $cleanedText = preg_replace('/^(?:Soal\s*)?\d+[\.\)\:\-]\s*/i', '', $trimmed);
                    $questionText = $cleanedText;
                } else {
                    $questionText .= ' '.$trimmed;
                }
            } elseif ($currentSection === 'explanation' && ! empty($explanation)) {
                $explanation .= ' '.$trimmed;
            }
        }

        if (empty($questionText) || count($options) < 2 || ! isset($options[$correctAnswer]) || $points < 1) {
            return null;
        }

        $formattedOptions = [];
        foreach ($options as $key => $val) {
            $formattedOptions[] = [
                'key' => $key,
                'value' => $val,
            ];
        }

        return [
            'question_text' => trim($questionText),
            'type' => 'multiple_choice',
            'options' => $formattedOptions,
            'correct_answer' => $correctAnswer,
            'explanation' => $explanation ? trim($explanation) : null,
            'points' => $points,
        ];
    }
}
