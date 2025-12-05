## Introduction

This hands-on lab provides a structured walkthrough of how to build a functional generative AI application using IBM watsonx.ai, DataStax Astra DB, and DataStax Langflow. The goal is to show how foundation models, embeddings, vector search, and workflow orchestration come together to support practical GenAI use cases. 

Throughout the session, you will build several increasingly capable flows, starting with a basic assistant, adding prompt control, enabling retrieval from your own document data, and finally constructing an agent that can use tools and evaluate external information.

By the end, you will have a working example of a GenAI application that integrates a foundation model, a vector database, and an orchestrated workflow. This lab focuses on the core patterns used in real projects so you can understand how these components operate and how they can be applied in your own environments.


## About the Workshop

This workshop shows how to use IBM watsonx.ai, IBM watsonx.data, DataStax Astra DB, and DataStax Langflow together to build retrieval-augmented generation (RAG) applications on your own data.

IBM watsonx.data streamlines the development and deployment of RAG workloads by providing secure, scalable data management from proof of concept to production, whether deployed in the cloud or self-managed. When combined with DataStax Astra DB as a vector-enabled NoSQL store, watsonx.data can serve as the data backbone for GenAI applications that need to index, search, and retrieve enterprise content efficiently.

Through deep integration with IBM watsonx.ai, IBM watsonx.data with DataStax Astra DB, and DataStax Langflow, this stack enables you to build generative AI applications that use IBM’s foundation models and embedding models while grounding responses in your own documents.

By the end of the workshop, you will have:

•	Created an end-to-end generative AI assistant in DataStax Langflow
•	Designed and implemented a basic retrieval-augmented generation (RAG) pattern
•	Integrated IBM watsonx.ai foundation models and embedding models into a Langflow pipeline
•	Spun up and configured a vector database on IBM watsonx.data using DataStax Astra DB
•	Built a retriever workflow that uses your own resume data for context
•	Constructed an agentic flow that can combine retrieved context with external information (e.g., job postings)

Some prior exposure to cloud services or APIs is helpful, but no prior AI or RAG experience is required. All implementation is performed through the Langflow visual interface.

## What we will build
A chatbot that can answer questions based on your own custom documents. We will use the hosted version of Langflow inside Astra (SaaS) to avoid any local installation headaches.

> TIP: Ensure you have a Google Cloud or GitHub account ready to sign up for the DataStax Astra services.

This workshop uses a simple, production-aligned GenAI stack built from IBM watsonx.ai, IBM watsonx.data, DataStax Astra DB, and DataStax Langflow. The sections below summarize what each component does and how they fit together for the lab.

DataStax Astra DB

DataStax Astra DB provides the vector-enabled data layer for the lab. It is a cloud-native NoSQL database with:

•	Hybrid search and vector search for unstructured and semi-structured data
•	Integration with IBM watsonx.data, making enterprise data accessible for AI-driven applications
•	JSON-based APIs for simple interaction from applications and tools
•	Real-time data processing suitable for production GenAI workloads
•	Seamless integration with existing enterprise systems

Astra DB is where your document embeddings will be stored and retrieved during the RAG sections of the lab.

DataStax Langflow

DataStax Langflow is the visual orchestration environment used throughout this workshop. It is an open-source IDE with:
•	Over 60,000 GitHub stars and 10,000+ active developers
•	A drag-and-drop interface for creating AI flows
•	Integration with Astra DB and IBM watsonx.ai
•	Support for tools, agents, prompts, embeddings, and model chaining

Langflow is being incorporated into IBM watsonx Orchestrate as part of the orchestration layer, enabling rapid prototyping and consistent workflow automation across data and model components.
Note: Menu interface may differ from instructions due to versioning (version used: 1.6.0)
IBM watsonx.ai

IBM watsonx.ai provides the models used in this lab:

•	Granite foundation models for general language understanding and generation
•	Slate embedding models for vectorizing text for similarity search

You will configure both model types directly inside Langflow.


# Initial Setup

## Login to Astra DB

1. Create an account or login to your Astra DB account at [astra.datastax.com](https://astra.datastax.com/login)

![](./pictures/002-astra-dashboard.png)

## Create Database

1. Click **Create Database**.
2. Choose **Serverless (Vector)**.
3. Name your database `workshop_db`.
4. Select a provider (e.g., AWS or GCP) and a region close to you.

![](./pictures/001-astra.png)

> WARNING: It may take 2-3 minutes for the database to initialize. Wait for the status to turn "Active".

## Create Collection

1. Click Data Explorer tab. This is where your collection will be created.

2. Click **Create Collection**.

3. Name your collection `vector_data`.

![](./pictures/003-astra-collection.png)

4. Give the collection a name of your preference.

5. For the Embedding generation method, select Bring my own. The representation for AI-ready data is called a vector embedding. Later, you will call IBM watsonx.ai, which will use an IBM Slate embedding model to create vector embeddings, inserting the data into your vector database.

6. For the dimensions select 768. The model you will use for creating vector embeddings is ibm/slate-125m-english-rtrvr. These dimensions were selected as per the documentation for embedding models hosted on [IBM watsonx.ai](https://www.ibm.com/docs/en/watsonx/w-and-w/2.0.0?topic=models-supported-embedding).

7. For the Similarity metric, select Dot Product from the dropdown list.

8. Click Create collection to finalize the creation. This may take a few minutes.

![](./pictures/004-astra-collection.png)

9. Click on the Overview tab.

![](./pictures/005-astra-overview.png)

10. Generate an Application Token

![](./pictures/006-astra-token.png)

Copy the **Token** string starting with `AstraCS:...`. Store this securely.

## Accessing Langflow

Astra DB provides a managed Langflow environment.

1. In your Astra Dashboard, look for the **Langflow** tab in the top right corner.

![](./pictures/007-astra-langflow.png)

2. Click on the langflow icon. This launches the visual IDE in a new tab, pre-connected to your Astra organization.

# Labs

## Lab 1 - Building the Flow

1. Click on Create first flow.

2. Click the Blank Flow button. You will build your first flow in this blank canvas.

![](./pictures/008-astra-langflow.png) 

3. The Langflow interface is designed for visual development of AI workflows. The Canvas is in the center, where you will build and connect components to define your flow logic. The Components and Bundles panels are located on the left menu and includes inputs, models, tools, and more options. These can be dragged onto your canvas to modify your flow. In the topright corner, the Playground lets you test your flow in an assistant interface, while the Share tab provides access details for integrating your flow into external applications.

![](./pictures/009-astra-langflow.png) 

4. In the Components section, click the Inputs/Output dropdown list. And drag and drop the Chat Input component onto the canvas.

![](./pictures/010-astra-langflow.png) 

5. Now drag and drop the Chat Output component to the right of the Chat Input component in the canvas.

![](./pictures/011-astra-langflow.png) 

6. In the Bundles section, click IBM. Drag and drop the IBM watsonx.ai component onto the canvas. And fill out the API key field with your saved credentials.

![](./pictures/012-astra-langflow.png) 

7. From the Model Name dropdown list, select ibm/granite-3-8b-instruct.
Connect the Chat Input component to the Input connector of the IBM watsonx.ai component. Connect the Model Response connector of the IBM watsonx.ai component to the Chat Output component. 

8. Click Controls at the top of the IBM watsonx.ai component. You will open settings to further configure the IBM watsonx.ai component. Locate the Stream field and toggle the Value to ‘on’ to enable streaming from the foundation model. Click Close.

![](./pictures/014-astra-langflow.png) 


### Testing the Flow

1. Click on the Playground tab in the top right corner.
2. Copy and paste the message below into the chat. For the output, you should expect a story, streaming a few words at a time:

```Tell me a short story in no more than four sentences.```

3. Observe the response from the foundation model.

![](./pictures/016-astra-langflow.png) 


## Lab 2 - Prompt Engineering

Prompt engineering refers to the deliberate and systematic formulation of instructions provided to a foundation model, with the objective of directing its behavior and improving the quality of its outputs. In this section, you will enhance your assistant by integrating a Prompt component into your DataStax Langflow canvas. This addition enables precise control over how the model interprets user input — whether by simplifying language, adjusting tone, or focusing on specific tasks. 

As a foundational technique, prompt engineering plays a pivotal role in aligning model responses with specific use cases and is instrumental in the development of robust, effective, and reliable AI applications.

1. Delete the link between the Chat Input component and the IBM watsonx.ai component.

![](./pictures/001-prompt-engineering.png) 

2. Drag the Prompt Template component from the Processing section onto the canvas. You will add a prompt to this component to guide the behavior of responses. Click Controls to open the Prompt Template settings.

![](./pictures/002-prompt-engineering.png) 

3. Click the Value text box in the Template field.

![](./pictures/003-prompt-engineering.png) 

4. Copy and paste the following prompt into the Template field. Click Check & Save to save the prompt details. And close once it is saved.

```
Answer the user as if you were speaking to a 5 year old. 
User: {user_input} 
Answer: 
```

5. Connect the Prompt Template component to the rest of the flow. Connect the Chat Input component to the user_input section of the Prompt Template component. Connect the Prompt Template to the Input connector of the IBM watsonx.ai component.

![](./pictures/004-prompt-engineering.png) 

6. Click on the Playground tab in the top right corner.

![](./pictures/005-prompt-engineering.png) 

7. The input prompt below is the same as the input used when you initially tested the assistant without the Prompt Template component. Copy and paste this prompt into the chat:

```Tell me a short story in no more than four sentences.```

Observe the change in the model’s response resulting from the prompt you applied. Prompt engineering facilitates the customization of a foundation model’s behavior and tone through the refinement of its input instructions. Even slight adjustments to a prompt can yield markedly different outputs, ranging from nuanced shifts in phrasing to entirely distinct response styles.

This technique is essential for tailoring model behavior to specific use cases, enhancing clarity, and ensuring alignment with user expectations. You may close the Playground window.

![](./pictures/006-prompt-engineering.png) 

## Lab 3 - RAG

### Introducing RAG & Vector Databases

Having constructed a foundational assistant and implemented a prompt to tailor response delivery, the next step involves enriching its capabilities through a retrieval-augmented generation (RAG)-enabled workflow. RAG is a sophisticated technique that enhances the performance of foundation models by grounding their outputs in external, domain-specific data sources. Rather than relying exclusively on pre-trained knowledge, RAG retrieves relevant information from a vector database—such as DataStax Astra DB—to inform the model’s responses in real time. This approach is particularly valuable when addressing queries based on proprietary or dynamic content.

RAG is especially effective in use cases such as legal document analysis, personalized healthcare recommendations, and resume-based job matching, where responses must be anchored in private, context-specific data.

Vector databases are integral to RAG workflows, as they store data in the form of high-dimensional embeddings, enabling fast and precise similarity searches. DataStax Astra DB, with its native vector capabilities, integrates seamlessly with DataStax Langflow, supporting the development of intelligent, context-aware applications.

### Setup Template & Database

In this section, you will examine the implementation of retrieval-augmented generation (RAG) utilizing DataStax Langflow in conjunction with DataStax Astra DB. The process commences with the opening of the Vector Store RAG template within DataStax Langflow, which includes two pre-configured flows, a Load Data Flow and a Retriever Flow.

1. Click Starter Project to return to your Projects.

![](./pictures/001-rag.png)

2. Click New Flow.

![](./pictures/002-rag.png)

3. Click the Vector Store RAG template. This will open the template that includes the Load Data Flow and Retriever Flow.

![](./pictures/003-rag.png)

4. The Load Data Flow will ingest and vectorize a PDF document into a new DataStax Astra DB vector database collection. You will be using your resume. Once your data is stored, the Retriever Flow will allow you to ask questions through the assistant, with responses generated using context pulled directly from your data. This hands-on experience demonstrates how RAG can be used to build intelligent, context-aware applications that respond with precision and relevance.

![](./pictures/004-rag.png)


### Create Embedding Model Component

In this section, you will configure the flows within the Vector Store RAG template to establish connections with your designated collection and integrate the IBM watsonx.ai Embedding component for creating vector embeddings.

1. Delete the OpenAI Embedding.	You will be using the IBM watsonx.ai Embeddings component for creating vector embeddings.

![](./pictures/005-rag.png)

2. In the Bundles section, click the IBM dropdown to display the IBM watonsx.ai Embeddings component. Drag and drop the IBM watsonx.ai Embeddings component onto the canvas. 

![](./pictures/006-rag.png)

3. Ensure your Astra DB tile has a section for Embedding Model. If it does not, use the search tool on the top left to replace the Astra DB tile and reconnect it with the Split Text tile. 

![](./pictures/007-rag.png) 

4. In the IBM watsonx.ai Embeddings component, enter the fields watsonx API Endpoint, Project ID, and API key with your saved IBM watsonx.ai credentials. For the Model Name, select ibm/slate-125m-english-rtrvr-v2. Recall that earlier, you specified the dimensions for your vector database according to the requirements for this model. Connect the Embedding Model connector of the IBM watsonx.ai Embeddings component to the Embedding Model section of the Astra DB component.

![](./pictures/008-rag.png)

### Create Astra DB Component

In this session you will connect to your vector database by configuring the Astra DB component.

1. Enter the Astra DB application token that you saved when the DataStax Astra DB was created in your lab preparation.

2. Select your database from the Database dropdown list.

3. When the database field is filled, a second field will appear for the collection. Select the collection you created earlier.

4. You will upload a file to be ingested by the flow and vectorized to the database. In this section, you will upload a PDF that is no more than 100mb. For this example, your resume will be used, as the templated questions you will ask after configuring the Retrieval Flow are targeted towards sections of your resume.

```Note: If you encounter errors with ingestion of a file in PDF format, try the same document but in a Word document format. ````

![](./pictures/009-rag.png)

The flow is now prepared for execution. Prior to initiating the full run, you may observe a triangular (play) icon positioned in the upper right corner of each component. This feature enables the individual execution of components, allowing for verification of proper configuration and expected functionality. Upon activation, the icon will update to display either a green checkmark, indicating successful execution, or a red X, signifying a failure. After a successful run, hovering over the icon will reveal the output generated by the respective component 

5. Click the run icon (triangle) in the top right corner of the Astra DB component to run your ingestion pipeline and insert the data into your vector database.

![](./pictures/010-rag.png)

### Optional: Verify Output

If you want, verify that the data has been successfully added to the database. This is useful for troubleshooting, but you may proceed to the next step if your flow has completed successfully. To do so, navigate back to the DataStax Astra DB interface and examine your database to ensure the information has been accurately ingested.

1. Login to your DataStax account at: https://astra.datastax.com/login.

2. From the DataStax Astra DB main screen, you will see the list of your available databases including their statuses. Your database Status should show Active. If it shows Hibernated, you will activate it when you click on the database.

![](./pictures/011-rag.png)

3. Click the Data Explorer tab to view your collection.

4. Verify that information has been added to the database. 

![](./pictures/012-rag.png)

```Note: The page content section in the screenshot has been blurred to hide sensitive information.```

```IMPORTANT: You can only configure the retriever flow if there is data in your Astra DB collection, as this is where the Retrieval Flow will pull data from.```

### Create Retrieval Flow

Retrieval-augmented generation (RAG) refers to the process of leveraging vector similarity search to identify data entries most likely to address a user's query. These retrieved results are then incorporated into the prompt as contextual information for the foundation model. To achieve this, the user's query must be embedded using the same methodology applied during the data ingestion phase.

In the next step, you will configure the Retriever Flow to enable question answering capabilities, ensuring that responses are supported by relevant knowledge retrieved from the vector database.

1. Return to Langflow Desktop. You will configure the Retriever Flow.

2. Since you will be using the IBM watsonx.ai Embeddings component for creating vector embeddings, you do not need the OpenAI Embeddings component. Click the OpenAI Embeddings component and delete it.

3. Since you will be using IBM watsonx.ai foundation models, you do not need the Language Model components with OpenAI selected. Delete the Language Model component with OpenAI selected from the canvas.

![](./pictures/001-retrieval.png)

4. Drag and drop the IBM watsonx.ai Embeddings component from the IBM dropdown list in the Bundles section.

![](./pictures/002-retrieval.png)

5. In the IBM watsonx.ai Embeddings component, enter the fields watsonx API Endpoint, Project ID, and API key with your saved IBM watsonx.ai credentials. For the Model Name, select ibm/slate-125m-english-rtrvr-v2 from the dropdown list.

![](./pictures/003-retrieval.png)

6. Ensure your Astra DB tile in retriever flow has a section for Embedding Model. If it does not, use the search tool on the top left to replace the Astra DB tile. 

You will connect to your vector database by configuring the Astra DB component, enter the Astra DB application token that you saved when the DataStax Astra DB was created in your lab preparation. 

Select your database from the Database dropdown list. When the database field is filled, a second field will appear for the collection. Select the collection you created earlier.

![](./pictures/004-retrieval.png)
