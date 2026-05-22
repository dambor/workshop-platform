# Langflow Workshop: Agentic RAG

This hands-on lab provides a structured walkthrough of how to build a functional generative AI application using Groq, DataStax Astra DB, and DataStax Langflow. The goal is to show how foundation models, embeddings, vector search, and workflow orchestration come together to support practical GenAI use cases. 

Throughout the session, you will build several increasingly capable flows, starting with a basic assistant, adding prompt control, enabling retrieval from your own document data, and finally constructing an agent that can use tools and evaluate external information.

By the end, you will have a working example of a GenAI application that integrates a foundation model, a vector database, and an orchestrated workflow. This lab focuses on the core patterns used in real projects so you can understand how these components operate and how they can be applied in your own environments.


## About the Workshop

This workshop shows how to use Groq, DataStax Astra DB, and DataStax Langflow together to build retrieval-augmented generation (RAG) applications on your own data.

DataStax Astra DB serves as the vector-enabled NoSQL store and data backbone for GenAI applications that need to index, search, and retrieve enterprise content efficiently.

Through integration with Groq's ultra-fast inference API, DataStax Astra DB, and DataStax Langflow, this stack enables you to build generative AI applications that leverage Groq-hosted models while grounding responses in your own documents.

By the end of the workshop, you will have:

- Created an end-to-end generative AI assistant in DataStax Langflow
- Designed and implemented an agentic retrieval-augmented generation (RAG) pattern
- Integrated Groq-hosted foundation models into a Langflow pipeline
- Spun up and configured a vector database using DataStax Astra DB with NVIDIA embeddings
- Built a data ingestion pipeline and an agentic retrieval workflow using your own resume data
- Constructed an agentic flow that can combine retrieved context with external information (e.g., job postings)

Some prior exposure to cloud services or APIs is helpful, but no prior AI or RAG experience is required. All implementation is performed through the Langflow visual interface.

## What we will build

A chatbot that can answer questions based on your own custom documents. We will use the hosted version of Langflow inside Astra (SaaS) to avoid any local installation headaches.

> TIP: Ensure you have a Google Cloud or GitHub account ready to sign up for the DataStax Astra services.

This workshop uses a simple, production-aligned GenAI stack built from Groq, DataStax Astra DB, and DataStax Langflow. The sections below summarize what each component does and how they fit together for the lab.



# Initial Setup

## Astra DB

DataStax Astra DB provides the vector-enabled data layer for the lab. It is a cloud-native NoSQL database with:

- Hybrid search and vector search for unstructured and semi-structured data
- JSON-based APIs for simple interaction from applications and tools
- Real-time data processing suitable for production GenAI workloads
- Seamless integration with existing enterprise systems

Astra DB is where your document embeddings will be stored and retrieved during the RAG sections of the lab.

### Login to Astra DB

1. Create an account or login to your Astra DB account at [astra.datastax.com](https://astra.datastax.com/login)

![](./pictures/002-astra-dashboard.png)

### Create Database

1. Click **Create Database**.

![](./pictures/001-astra.png)

2. Choose **Serverless (Vector)**, name your database `workshop_db` and select a provider (e.g., AWS or GCP) and a region close to you.

![](./pictures/002-astra.png)

> WARNING: It may take 2-3 minutes for the database to initialize. Wait for the status to turn "Active".

3. Once the database is active, copy the **API Endpoint** and click on **Application Tokens** to create a token. 

![](./pictures/003-astra.png)

Copy the **Token** string starting with `AstraCS:...`. Store this securely. 

### Create Collection

1. Click Data Explorer tab. This is where your collection will be created.

2. Click **Create Collection**.

![](./pictures/001-collection.png)

3. Name your collection `vector_data`. For the Embedding generation method, select **NVIDIA** and **nvidia/nv-embedqa-e5-v5** as the embedding model. For the dimensions, select **1024**. For the Similarity metric, select **Cosine** from the dropdown list. Click **Create collection** to finalize the creation. This may take a few minutes.

![](./pictures/002-collection.png)

4. Once the collection is created, you'll see the collection details in the **Data Explorer** tab.

![](./pictures/003-collection.png)

5. Your Astra DB is ready to use. Now move to the next section to setup your Langflow environment.

## Lagflow

Langflow is an open-source, Python-based, customizable framework for building AI applications. It supports important AI functionality like agents and the Model Context Protocol (MCP), and it doesn't require you to use specific large language models (LLMs) or vector stores.

The visual editor simplifies prototyping of application workflows, enabling developers to quickly turn their ideas into powerful, real-world solutions. It is an open-source IDE with:

- Over 100,000 GitHub stars and 10,000+ active developers
- A drag-and-drop interface for creating AI flows
- Integration with Astra DB and multiple model providers including Groq
- Support for tools, agents, prompts, embeddings, and model chaining


### Accessing Langflow

Astra DB provides a managed Langflow environment.

1. In your Astra Dashboard, look for the **Langflow** tab in the top right corner.

![](./pictures/001-langflow.png)

2. Click on the langflow icon. This launches the visual IDE in a new tab, pre-connected to your Astra organization.

![](./pictures/002-langflow.png)

3. Your environment is ready to use. Now move to the next section to setup your Groq API key.

## Groq

Groq provides ultra-fast AI inference powered by its custom Language Processing Unit (LPU) hardware. In this lab, Groq is used for:

- **LLM inference** — Running models like Llama 3 and Mixtral at extremely low latency for chat and generation tasks
- **Embedding generation** — Using Groq-hosted embedding models for vectorizing text for similarity search

You will configure Groq model components directly inside Langflow using your Groq API key.

> TIP: Sign up for a free Groq API key at [console.groq.com](https://console.groq.com). Save your API key securely — you will need it throughout the workshop.

### Groq API Key

1. Go to [console.groq.com](https://console.groq.com).
2. Create an account or login to your Groq account.
3. Click on **API Keys** in the top right corner.
4. Click on **Create API Key**.
5. Name your API key `workshop` and click **Create**.
6. Copy the API key and store it securely.

![](./pictures/001-groq.png)

7. Your Groq API key is ready to use. Now move to the next section to the first lab.

# Labs

## Lab 1 - Building the Flow

DataStax Langflow is a sophisticated visual development environment that streamlines the creation of AI workflows, particularly in contexts involving foundation models and vector databases. Within enterprise environments, DataStax Langflow empowers teams to rapidly prototype and iterate on AI-driven solutions without the need for manual coding, thereby fostering effective collaboration between technical and business stakeholders.

In this workshop, DataStax Langflow functions as the orchestration layer, enabling users to visually integrate components such as models, prompts, and data sources. This methodology closely aligns with the architecture of contemporary AI applications deployed in production, where modularity, agility, and scalability are paramount to success.

### Steps

1. Click on **Create first flow**.

2. Click the **Blank Flow** button. You will build your first flow in this blank canvas.

![](./pictures/008-astra-langflow.png) 

3. The Langflow interface is designed for visual development of AI workflows. The Canvas is in the center, where you will build and connect components to define your flow logic. The Components and Bundles panels are located on the left menu and includes inputs, models, tools, and more options. These can be dragged onto your canvas to modify your flow. In the top right corner, the Playground lets you test your flow in an assistant interface, while the Share tab provides access details for integrating your flow into external applications.

![](./pictures/009-astra-langflow.png) 

4. In the Components section, click the **Inputs/Output** dropdown list. Drag and drop the **Chat Input** component onto the canvas.

![](./pictures/010-astra-langflow.png) 

5. Now drag and drop the **Chat Output** component to the right of the Chat Input component in the canvas.

![](./pictures/011-astra-langflow.png) 

6. In the Components section, search for Groq and drag and drop the **Groq** component onto the canvas. Fill out the **Groq API Key** field with your saved Groq API key.

![](./pictures/012-astra-langflow.png)

7. From the **Model Name** dropdown list, select `llama-3.3-70b-versatile` (or another available model such as `mixtral-8x7b-32768`).

   Connect the Chat Input component to the Input connector of the Groq component. Connect the Model Response connector of the Groq component to the Chat Output component.

8. Click **Controls** at the top of the Groq component. You will open settings to further configure the component. Locate the **Stream** field and toggle the Value to **on** to enable streaming from the model. Click Close.

![](./pictures/014-astra-langflow.png) 


### Testing the Flow

1. Click on the **Playground** tab in the top right corner.
2. Copy and paste the message below into the chat. For the output, you should expect a story, streaming a few words at a time:

```
Tell me a short story in no more than four sentences.
```

3. Observe the response from the model. Note how fast Groq's inference is compared to other providers — this is thanks to Groq's custom LPU hardware optimized for low-latency inference.

![](./pictures/016-astra-langflow.png) 


## Lab 2 - Prompt Engineering

Prompt engineering refers to the deliberate and systematic formulation of instructions provided to a foundation model, with the objective of directing its behavior and improving the quality of its outputs. In this section, you will enhance your assistant by integrating a Prompt component into your DataStax Langflow canvas. This addition enables precise control over how the model interprets user input — whether by simplifying language, adjusting tone, or focusing on specific tasks. 

As a foundational technique, prompt engineering plays a pivotal role in aligning model responses with specific use cases and is instrumental in the development of robust, effective, and reliable AI applications.

### Steps


1. Copy and paste the following prompt into the **System Message** field. Click **Check & Save** to save the prompt details. And close once it is saved.

```
Answer the user as if you were speaking to a 5 year old. 
User: {user_input} 
Answer: 
```

![](./pictures/013-astra-langflow.png)


6. Click on the **Playground** tab in the top right corner.

7. The input prompt below is the same as the input used when you initially tested the assistant without the Prompt Template component. Copy and paste this prompt into the chat:

```
Tell me a short story in no more than four sentences.
```

Observe the change in the model's response resulting from the prompt you applied. Prompt engineering facilitates the customization of a foundation model's behavior and tone through the refinement of its input instructions. Even slight adjustments to a prompt can yield markedly different outputs, ranging from nuanced shifts in phrasing to entirely distinct response styles.

This technique is essential for tailoring model behavior to specific use cases, enhancing clarity, and ensuring alignment with user expectations. You may close the Playground window.

![](./pictures/006-prompt-engineering.png) 

## Lab 3 - Agentic RAG

Having constructed a foundational assistant and implemented a prompt to tailor response delivery, the next step involves enriching its capabilities through retrieval-augmented generation (RAG) combined with an agentic workflow. RAG enhances foundation models by grounding their outputs in external, domain-specific data sources. Rather than relying exclusively on pre-trained knowledge, RAG retrieves relevant information from a vector database—such as DataStax Astra DB—to inform the model's responses in real time.

In this lab, you will take an agentic approach to RAG. Instead of building a traditional retriever pipeline, you will give an AI agent direct access to your Astra DB collection as a tool. The agent can then autonomously decide when and how to query your data, combine it with other tools (like URL browsing), and reason over the results to produce high-quality answers.

This approach is especially effective for use cases such as legal document analysis, personalized healthcare recommendations, and resume-based job matching, where responses must be anchored in private, context-specific data.

### Part 1: Data Ingestion

In this section, you will build a simple ingestion flow to load a document into your Astra DB vector database. The flow uses three components: **File** (to load the document), **Split Text** (to chunk it into smaller pieces), and **Astra DB** (to store the chunks as vector embeddings). Since your collection was created with the NVIDIA embedding integration, Astra DB handles embedding generation automatically.

1. Click **Starter Project** to return to your Projects.

![](./pictures/lab3-part1-001.png)

2. Click **New Flow**.

3. Click **Blank Flow**. You will build the ingestion pipeline from scratch.

![](./pictures/008-astra-langflow.png)

4. In the Components section, search for **File** and drag and drop the **File** component onto the canvas. This component will load your document.

![](./pictures/lab3-part1-002.png)

5. Search for **Split Text** and drag and drop the **Split Text** component onto the canvas. This component will chunk your document into smaller pieces suitable for vector storage.

   Connect the **Raw Content** output of the File component to the **Input** input of the Split Text component.

![](./pictures/lab3-part1-003.png)

6. Search for **Astra DB** and drag and drop the **Astra DB** component from the Vector Stores section onto the canvas.

   Configure the Astra DB component:
   - Enter the **Astra DB Application Token** you saved during setup
   - Select your **Database** from the dropdown list
   - Select the `vector_data` **Collection** you created earlier

   > NOTE: Since the collection was created with the NVIDIA embedding provider, the Astra DB component does not require an Embedding Model connection. Embeddings are computed server-side by Astra DB.

   Connect the **Chunks** output of the Split Text component to the **Ingest Data** input of the Astra DB component.

![](./pictures/lab3-part1-004.png)

7. Upload a PDF document (no more than 100MB) using the **File** component. For this example, use your resume — the questions you will ask later are targeted towards resume content.

   > Note: If you encounter errors with a PDF file, try the same document in Word format.

![](./pictures/lab3-part1-005.png)

8. Click the **run icon** (triangle) in the top right corner of the Astra DB component to run the ingestion pipeline and insert the data into your vector database.

#### Optional: Verify Output

If you want, verify that the data has been successfully added to the database. Navigate back to the DataStax Astra DB interface and examine your database.

1. Login to your DataStax account at: https://astra.datastax.com/login.

2. Your database Status should show **Active**. If it shows Hibernated, it will activate when you click on the database.


3. Click the **Data Explorer** tab to view your collection.

4. Verify that information has been added to the database.

![](./pictures/lab3-part1-006.png)

> IMPORTANT: You can only proceed to the agentic retrieval flow if there is data in your Astra DB collection.

### Part 2: Agentic Retrieval

Now that your data is stored in Astra DB, you will build an AI agent that can autonomously retrieve and reason over your documents. Agentic AI refers to systems capable of reasoning, decision-making, and autonomous action based on user input and available tools. Unlike conventional retriever pipelines, agents can dynamically decide when to query the database, combine results with other tools, and adapt their behavior to achieve defined objectives.

In this section, you will use the **Agent** template within Langflow and configure it to use your Astra DB collection as a tool.

1. On the same project, search for **Agent** in the Components section and drag and drop it onto the canvas.

![](./pictures/lab3-part2-001.png)

2. Configure the Agent component to use Groq for LLM inference. Under the **Language Model** field, select **Connect other models** from the drop-down list. You will link a Groq component to this field.

![](./pictures/lab3-part2-002.png)

3. Drag and drop the **Groq** model component onto the canvas.

• Configure the details for the connection using your Groq API key.

• Select `llama-3.3-70b-versatile` from the **Model Name** dropdown list.

• Select **Language Model** from the **Model Response** dropdown list.

• Connect the **Language Model** connector of the Groq model component to the **Language Model** section of the Agent component.

![](./pictures/lab3-part2-003.png)

4. Search for **Astra DB** in the Components section and drag and drop it onto the canvas.

• Enable **Tool Mode** by toggling the switch in the Astra DB component. This will allow it to connect to the Agent component.

• Configure the Astra DB component by entering your Astra DB application token.

• Select your **Database** and **Collection** from the respective dropdown lists.

• Connect the **Toolset** connector of the Astra DB component to the **Tools** section of the Agent component.

![](./pictures/lab3-part2-004.png)

5. Copy and paste the message below into the **Agent Instructions** section of the Agent component:

```
You are an agent specializing in job experience information pertaining to [insert your name]. For job experience stored in Astra DB do not use URL tool even if job experience contains URLs. Only use URLs to check job descriptions.
```

![](./pictures/lab3-part2-005.png)

6. Add the **Chat Input** component to the canvas.

![](./pictures/lab3-part2-006.png)

7. Add the **Chat Output** component to the canvas.

![](./pictures/lab3-part2-007.png)

8. Your flow should look like this:

![](./pictures/lab3-part2-008.png)

### Testing the Agentic RAG Flow

1. In the Playground, test your agent with the following prompt, noting the output generated by the model:

```
Summarize my job experience
```

The agent will autonomously query your Astra DB collection to retrieve relevant document chunks and use them to generate a grounded response.

2. Test the agent with a more advanced prompt that combines database retrieval with URL browsing:

```
Can you tell me if my job experience is a good fit for this role: <insert link to job posting here>
```

> Note: For the job posting link, select any job posting from a careers website of your choice (e.g., LinkedIn, Indeed, or a company careers page).

> Note: If the output appears inaccurate or unrelated (hallucination), try switching models. For example, test with `llama-3.1-8b-instant`, or other available Groq models. Compare responses and choose the model that best fits your use case.

You have successfully developed an agentic RAG flow that combines document retrieval from your vector database with autonomous reasoning and tool usage. The agent can query your stored documents, browse external URLs, and synthesize information to produce informed responses. You are encouraged to further test the flow by submitting additional queries. Once the evaluation is complete, you may close the Playground window.

## Summary

Congratulations on completing all the exercises! In this workshop you have:

- Set up DataStax Astra DB with a vector collection using the NVIDIA embedding integration.
- Retrieved and configured Groq API credentials for LLM inference.
- **Lab 1:** Built a basic conversational assistant using Groq and DataStax Langflow.
- **Lab 2:** Applied prompt engineering to customize model behavior and tone.
- **Lab 3:** Implemented an end-to-end agentic RAG workflow:
  - Ingested and vectorized a document into Astra DB using a File → Split Text → Astra DB pipeline.
  - Built an AI agent that autonomously retrieves context from your vector database, browses external URLs, and reasons over the results.
  - Tested the agent's ability to summarize your experience and evaluate job fit by combining stored data with live job postings.

