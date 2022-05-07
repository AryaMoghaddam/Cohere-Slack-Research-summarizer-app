
# A Slack bot which receives the URL of a paper from Arxiv and then uses Cohere’s LLMs to summarize the abstract and return a one-sentence summary.
![image](https://user-images.githubusercontent.com/63557848/167219007-156db099-9ab3-4bd3-942e-3df1558b3b03.png)

## I used Bolt.js to create a Slack app and Cohere's Text generator API to summarize reasearch papers.

### Setting up Cohere
![create-api-key-40f59c326a07aed4e259fecd7ec036f6](https://user-images.githubusercontent.com/63557848/167220054-f7de55c8-fe02-4c4d-ac30-8be049df72d1.gif)

### Creating the app 
!![create-slack-app-web-ui-d10550b4adcadd8bf852e9c8bea5d2d4](https://user-images.githubusercontent.com/63557848/167220073-a006bc11-291c-412e-8945-d943d94b3082.gif)

### Grab App credentials and bot user token from the web ui as a final step.
![install-slack-app-to-workspace-6bf8160f35cf17b7a75f1a72ff189203](https://user-images.githubusercontent.com/63557848/167220142-ad02e580-c96e-4a7b-9536-c8a5c4c29d9a.gif)
![configure-event-subscriptions-0cbdf39927544ecd50a77dbbfc4d8714](https://user-images.githubusercontent.com/63557848/167220173-041d8fae-0bc9-4bd1-8a40-d5bce87340b7.gif)

### Coding the bot
Each plugin is grouped as either a reaction plugin or mention plugin. Contributions could be as simple as writing a prompt matching a desired persona or as complex as a command-line request-reply sequence.
![starter-project-layout-c539173e3c632af786e3ff7eee78f6dd](https://user-images.githubusercontent.com/63557848/167220223-03dc9df9-71f6-4391-b769-d6b7ead7e45d.gif)

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
  
  ### The bot returns a response message when prompted
  ![Screen Recording 2022-05-06 at 8 12 02 PM](https://user-images.githubusercontent.com/63557848/167229895-354c2c30-42ea-42b9-890d-09f9b0cdf234.gif)

  ### We can also adjust the app.js to include a button along with a text message
  
