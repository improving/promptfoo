# GitHub Copilot CLI provider for promptfoo with model selection

$Prompt = $args[0]
$Options = $args[1]
$Context = $args[2]

# Parse OPTIONS to get model from config
$Model = ""  # Default to empty (no model flag)
if ($Options -and $Options -ne '{}') {
    try {
        $OptionsObj = $Options | ConvertFrom-Json
        if ($OptionsObj.config.model) {
            $Model = $OptionsObj.config.model
        }
    } catch {
        # If JSON parsing fails, use empty string
        $Model = ""
    }
}

# Build command with optional model flag
if ($Model) {
    gh copilot --prompt $Prompt --model $Model --allow-all-tools --silent
} else {
    gh copilot --prompt $Prompt --allow-all-tools --silent
}