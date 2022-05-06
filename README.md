
# A Slack bot which receives the URL of a paper from Arxiv and then uses Cohere’s LLMs to summarize the abstract and return a one-sentence summary.
![image](https://user-images.githubusercontent.com/63557848/167219007-156db099-9ab3-4bd3-942e-3df1558b3b03.png)

## I used Bolt.js to create a Slack app and Cohere's Text generator API to summarize reasearch papers.

### Setting up Cohere
![create-api-key-40f59c326a07aed4e259fecd7ec036f6](https://user-images.githubusercontent.com/63557848/167206765-d94525e4-47f2-417a-a9d3-97a386056d06.gif)

### Creating the app 
![image](https://user-images.githubusercontent.com/63557848/167219103-2ed5afbe-c379-4a6f-8823-2055fd8093f2.png)

### Grab App credentials and bot user token from the web ui as a final step.
![image](https://user-images.githubusercontent.com/63557848/167219182-07151070-ce83-487f-a5a9-025f95eb6db3.png)
![image](https://user-images.githubusercontent.com/63557848/167219202-a6ee0be0-8e03-4fbf-9369-10c149e3f6ac.png)

### Coding the bot
Each plugin is grouped as either a reaction plugin or mention plugin. Contributions could be as simple as writing a prompt matching a desired persona or as complex as a command-line request-reply sequence.
![image](https://user-images.githubusercontent.com/63557848/167219309-09808f31-5927-4579-b865-dde742bb09ac.png)

### fetching an Abstract from Arxiv
We will need to teach our bot how to fetch an abstract before we can summarize it.

 ```
     /**
   * abstract fetches a paper's abstract given its hyperlink url
   * @param {string} url - http url for a paper (ex: https://arxiv.org/abs/1706.03762)
   * @return {string} abstract parsed from the provided hyperlink
   **/
  async abstract(url) {
    try {
      const { data } = await axios.get(url);
      const dom = new JSDOM(data);
      const { document } = dom.window;
      const abstract = document.querySelector("#abs > blockquote");
      return abstract.textContent;
    } catch (error) {
      throw error;
    }
  }
  ```
  
  ### Summarixig with Cohere
  Summarization can be achieved using a well-crafted prompt and Cohere’s generation API endpoint.
  ```
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
  ```
  
  Perform a cohere.generate():
  ```

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
  ```
  
