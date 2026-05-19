/**
 * Custom evaluation script for promptfoo
 * This script performs custom deterministic evaluations
 */

module.exports = {
  /**
   * Check if the response contains proper code formatting
   */
  hasCodeFormatting: (output) => {
    const hasCodeBlock = /```[\s\S]*?```/.test(output);
    return {
      pass: hasCodeBlock,
      score: hasCodeBlock ? 1 : 0,
      reason: hasCodeBlock ? 'Response contains code formatting' : 'Response lacks code formatting'
    };
  },

  /**
   * Check if the response explains the "why" behind concepts
   */
  explainsWhy: (output) => {
    const whyIndicators = ['because', 'reason', 'why', 'purpose', 'intended to', 'designed to'];
    const hasExplanation = whyIndicators.some(indicator => 
      output.toLowerCase().includes(indicator)
    );
    return {
      pass: hasExplanation,
      score: hasExplanation ? 1 : 0,
      reason: hasExplanation ? 'Response explains reasoning' : 'Response lacks explanation of why'
    };
  },

  /**
   * Check if response mentions edge cases or best practices
   */
  mentionsBestPractices: (output) => {
    const practiceIndicators = ['best practice', 'edge case', 'consider', 'note', 'warning', 'however'];
    const hasPractices = practiceIndicators.some(indicator => 
      output.toLowerCase().includes(indicator)
    );
    return {
      pass: hasPractices,
      score: hasPractices ? 1 : 0.5,
      reason: hasPractices ? 'Response mentions best practices or edge cases' : 'Response could mention best practices'
    };
  },

  /**
   * Check response length for conciseness
   */
  isConcise: (output) => {
    const wordCount = output.split(/\s+/).length;
    const isConcise = wordCount > 20 && wordCount < 300;
    return {
      pass: isConcise,
      score: isConcise ? 1 : 0.5,
      reason: isConcise ? 'Response is concise' : `Response has ${wordCount} words (target: 20-300)`
    };
  }
};