/**
 * prompt specified during a summarize subcommand
 * @return {string} all trailing arguments parsed from the entire summarize command
 */
async prompt() {
    const urlWithBraces = this.mention.arguments()[0];
    const url = urlWithBraces.replace("<", "").replace(">", "");
    const abstract = await this.abstract(url);
    const prompt = `"Summarize the following paper in 1 sentence:\n
      ${abstract}\n\n
      Summary:\n
      The paper details`;

    return prompt;
}

/**
 * prompt specified during a summarize subcommand
 * @return {string} all trailing arguments parsed from the entire summarize command
 */
async prompt() {
    const urlWithBraces = this.mention.arguments()[0];
    const url = urlWithBraces.replace("<", "").replace(">", "");
    const abstract = await this.abstract(url);
    const prompt = `"Summarize the following paper in 1 sentence:\n
      ${abstract}\n\n
      Summary:\n
      The paper details`;

    return prompt;
}


/**
 * summarize text using Cohere's generation endpoint
 * @return {string} summarized text from Cohere's generation endpoint.
 */
async summarize() {
    const prompt = await this.prompt();
    cohere.init(COHERE_API_TOKEN);

    const res = await cohere.generate("large", {
        prompt: prompt,
        stop_sequences: ["."],
        max_tokens: 140,
        temperature: 1,
    });

    if (res.statusCode != 200) {
        throw new Error(`${res.statusCode} received from cohere API`);
    }

    return res.body.generations[0].text;
}