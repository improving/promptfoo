# Devin CLI provider for promptfoo with model selection

$Prompt = $args[0]
$Options = $args[1]
$Context = $args[2]

# Parse OPTIONS to get model from config
$Model = "SWE-1.6"  # Default model
if ($Options) {
    try {
        $OptionsObj = $Options | ConvertFrom-Json
        if ($OptionsObj.config.model) {
            $Model = $OptionsObj.config.model
        }
    } catch {
        # If JSON parsing fails, use default
        $Model = "SWE-1.6"
    }
}

# Call devin cli with single-turn mode and specified model
# Use -- before prompt to properly separate it from flags
devin -p --model $Model -- $Prompt