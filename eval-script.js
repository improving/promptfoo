/**
 * Custom evaluation script for promptfoo
 * This script performs custom deterministic evaluations
 * Functions return boolean values for promptfoo assertions
 */

/**
 * Check if the response contains proper code formatting
 */
function hasCodeFormatting(output) {
  const hasCodeBlock = /```[\s\S]*?```/.test(output);
  return hasCodeBlock;
}

/**
 * Check if the response explains the "why" behind concepts
 */
function explainsWhy(output) {
  const whyIndicators = ['because', 'reason', 'why', 'purpose', 'intended to', 'designed to'];
  const hasExplanation = whyIndicators.some(indicator =>
    output.toLowerCase().includes(indicator)
  );
  return hasExplanation;
}

/**
 * Check if response mentions edge cases or best practices
 */
function mentionsBestPractices(output) {
  const practiceIndicators = ['best practice', 'edge case', 'consider', 'note', 'warning', 'however'];
  const hasPractices = practiceIndicators.some(indicator =>
    output.toLowerCase().includes(indicator)
  );
  return hasPractices;
}

/**
 * Check response length for conciseness
 */
function isConcise(output) {
  const wordCount = output.split(/\s+/).length;
  const isConciseLength = wordCount > 20 && wordCount < 300;
  return isConciseLength;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    hasCodeFormatting,
    explainsWhy,
    mentionsBestPractices,
    isConcise
  };
}