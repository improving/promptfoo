# Claude Code CLI provider for promptfoo with model selection

$Prompt = $args[0]
$Options = $args[1]
$Context = $args[2]

# Parse OPTIONS to get model from config
$Model = "haiku"  # Default model
if ($Options -and $Options -ne '{}') {
    try {
        $OptionsObj = $Options | ConvertFrom-Json
        if ($OptionsObj.config.model) {
            $Model = $OptionsObj.config.model
        }
    } catch {
        # If JSON parsing fails, use default
        $Model = "haiku"
    }
}

# Build command with optional model flag
if ($Model) {
    claude -p $Prompt --model $Model
} else {
    claude -p $Prompt
}