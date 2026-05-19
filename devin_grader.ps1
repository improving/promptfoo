# Devin CLI grader for promptfoo llm-rubric assertions
#
# promptfoo sends graders a JSON chat array: [{role, content}, ...]
# Devin's -p flag doesn't have a --system-prompt equivalent, so we
# concatenate the system instructions and user message into one prompt.

$Prompt = $args[0]
$Options = $args[1]

# Parse OPTIONS to get model from config
$Model = "SWE-1.6"  # Default model
if ($Options -and $Options -ne '{}') {
    try {
        $OptionsObj = $Options | ConvertFrom-Json
        if ($OptionsObj.config.model) {
            $Model = $OptionsObj.config.model
        }
    } catch {
        $Model = "SWE-1.6"
    }
}

# Parse the JSON chat message array that promptfoo sends to graders
try {
    $Messages  = $Prompt | ConvertFrom-Json
    $SystemMsg = ($Messages | Where-Object { $_.role -eq 'system' } | Select-Object -First 1).content
    $UserMsg   = ($Messages | Where-Object { $_.role -eq 'user'   } | Select-Object -First 1).content
} catch {
    # Fallback: treat the whole thing as a user message
    $SystemMsg = "You are an evaluator. Respond with only valid JSON: {`"pass`": bool, `"score`": 0.0-1.0, `"reason`": `"string`"}"
    $UserMsg   = $Prompt
}

# Combine system and user into one prompt
$FullPrompt = "$SystemMsg`n`n$UserMsg"

devin -p --model $Model -- $FullPrompt
