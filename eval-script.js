/**
 * Custom evaluation script for promptfoo
 * Called directly from promptfooconfig.yaml using: file://eval-script.js:functionName
 *
 * Each function receives (output, context) where output is the LLM response string.
 * Functions must return a boolean, number, or { pass, score, reason } object.
 */

/**
 * Check if the response contains code formatting (fenced blocks or inline backticks)
 */
function hasCodeFormatting(output) {
  const hasFencedBlock = /```[\s\S]*?```/.test(output);
  const hasInlineCode = /`[^`]+`/.test(output);
  // kiro-cli renders markdown, stripping fences but leaving language tag on its own line
  const hasRenderedBlock = /^(javascript|typescript|python|go|java|rust|bash|sh)\n/m.test(output);
  return hasFencedBlock || hasInlineCode || hasRenderedBlock;
}

/**
 * Check if the response provides an explanation (not just a list of facts)
 */
function explainsWhy(output) {
  const explanationIndicators = [
    'because', 'reason', 'why', 'purpose', 'intended to', 'designed to',
    'means that', 'this allows', 'this prevents',
    'performs', 'converts', 'coercion', 'unlike', 'whereas', 'which means',
    'ensures', 'checks', 'validates', 'since', 'uses', 'this means',
    'will ', 'allows ', 'prevents ', 'returns ',
  ];
  return explanationIndicators.some(indicator => output.toLowerCase().includes(indicator));
}

/**
 * Check if response mentions best practices, caveats, or practical guidance
 */
function mentionsBestPractices(output) {
  const practiceIndicators = [
    'best practice', 'edge case', 'consider', 'note', 'warning', 'however',
    'recommend', 'avoid', 'prefer', 'always', 'never', 'make sure',
    'pattern', 'approach', 'important', 'useful',
  ];
  return practiceIndicators.some(indicator => output.toLowerCase().includes(indicator));
}

/**
 * Check response length is within a reasonable range (50–500 words)
 */
function isConcise(output) {
  const wordCount = output.split(/\s+/).filter(Boolean).length;
  return wordCount >= 50 && wordCount <= 500;
}

function hasPRDSections(output) {
  const sections = [
    'Vision',
    'Goals',
    'Personas',
    'User Stories',
    'Functional Requirements',
    'Non-Functional Requirements',
    'Metrics',
    'Risks',
  ];

  const missingSections = sections.filter(section => !output.includes(section));

  const score = (sections.length - missingSections.length) / sections.length;

  return {
    pass: score >= 0.7,
    score: score,
    reason: missingSections.length === 0 ? 'All PRD sections present' : `Missing sections: ${missingSections.join(', ')}`,
  }

  return sections.every(section => output.includes(section));
}

module.exports = { hasCodeFormatting, explainsWhy, mentionsBestPractices, isConcise, hasPRDSections };
