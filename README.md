"# Expense-Vision:" AI-Powered Receipt \& Expense Tracker



A full-stack web application that digitizes and analyzes physical and digital receipts using a multimodal AI model, allowing users to effortlessly track their expenses.



!\[Application Dashboard Screenshot](link-to-your-screenshot.png)



\## About The Project



This project was built to solve the common problem of manually tracking expenses from paper receipts. Expense-Vision allows a user to simply upload a photo or PDF of a receipt, and a powerful AI backend automatically extracts, structures, and saves the expense data. The system is built with a modern microservice architecture, separating the core backend logic from the specialized AI processing service.



\## Key Features



\- \*\*Secure User Authentication:\*\* Full registration and login system using Java Spring Security.

\- \*\*Multi-Format Receipt Upload:\*\* Accepts both \*\*image (JPG, PNG)\*\* and \*\*PDF\*\* receipt files.

\- \*\*AI-Powered OCR \& Parsing:\*\* Uses the multimodal \*\*Google Gemini 2.5 Flash\*\* model to perform both OCR and intelligent data extraction in a single step.

\- \*\*Intelligent Data Extraction:\*\* The AI is prompted to extract key information, including:

&nbsp;   - Store Name

&nbsp;   - Receipt Date

&nbsp;   - Individual Items (with quantity and price)

&nbsp;   - Total Discount

&nbsp;   - A calculated Final Total (sum of items minus discount)

\- \*\*Dynamic Dashboard:\*\* A responsive frontend built with Bootstrap and JavaScript that displays all expenses, neatly grouped by date in an interactive accordion view.

\- \*\*Fully Containerized:\*\* The entire multi-service application (Java Backend, Python AI Service, MySQL Database) is containerized using \*\*Docker\*\* for consistent and easy deployment.



\## Tech Stack



\- \*\*Backend:\*\* Java 17, Spring Boot, Spring Security, Spring Data JPA

\- \*\*AI Service:\*\* Python, Flask, Google Generative AI

\- \*\*Database:\*\* MySQL 8.0

\- \*\*Frontend:\*\* HTML5, CSS3, Bootstrap 5, Vanilla JavaScript

\- \*\*DevOps:\*\* Docker, Docker Compose



\## Architecture



The application is designed with a clean separation of concerns, following a microservice-style pattern:

```



\[Frontend (Browser)] \\<--\\> \[Java Spring Boot Backend] \\<--\\> \[Python Flask AI Service] --\\> \[Google Gemini API]

|

V

\[MySQL Database]



````



\## Getting Started



Follow these steps to get a local copy up and running.



\### Prerequisites



\- Java 17+ and Maven

\- Docker Desktop

\- A Google Gemini API Key



\### Installation \& Setup



1\.  \*\*Clone the repository:\*\*

&nbsp;   ```sh

&nbsp;   git clone \[https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)

&nbsp;   cd your-repo-name

&nbsp;   ```



2\.  \*\*Configure Environment Variables:\*\*

&nbsp;   This project requires a Google Gemini API key. In the `docker-compose.yml` file, find the `ai-service` definition and replace the placeholder with your actual key.

&nbsp;   ```yaml

&nbsp;   # in docker-compose.yml

&nbsp;   environment:

&nbsp;     - GEMINI\_API\_KEY=your\_gemini\_key\_here

&nbsp;   ```



3\.  \*\*Build the Java Application:\*\*

&nbsp;   Navigate to the backend service directory and run the Maven package command. This will create a runnable `.jar` file.

&nbsp;   ```sh

&nbsp;   cd backend-service

&nbsp;   mvn clean package

&nbsp;   cd ..

&nbsp;   ```



4\.  \*\*Run the Entire Application:\*\*

&nbsp;   From the root directory, use Docker Compose to build the images and start all the services.

&nbsp;   ```sh

&nbsp;   docker-compose up --build

&nbsp;   ```

&nbsp;   The application will be available at `http://localhost:8080`.



````

