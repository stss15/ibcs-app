#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const contentRoot = './src/content';

// Complete IB Computer Science syllabus structure
const structure = {
  'A1': {
    'A1.1': 9, // A1.1.1 through A1.1.9 (already exists)
    'A1.2': 5, // A1.2.1 through A1.2.5 (already exists)
    'A1.3': 7, // A1.3.1 through A1.3.7
    'A1.4': 1  // A1.4.1 (HL only)
  },
  'A2': {
    'A2.1': 5, // A2.1.1 through A2.1.5
    'A2.2': 4, // A2.2.1 through A2.2.4
    'A2.3': 4, // A2.3.1 through A2.3.4
    'A2.4': 4  // A2.4.1 through A2.4.4
  },
  'A3': {
    'A3.1': 1, // A3.1.1
    'A3.2': 7, // A3.2.1 through A3.2.7
    'A3.3': 6, // A3.3.1 through A3.3.6
    'A3.4': 4  // A3.4.1 through A3.4.4 (HL only)
  },
  'A4': {
    'A4.1': 2, // A4.1.1 through A4.1.2
    'A4.2': 3, // A4.2.1 through A4.2.3 (HL only)
    'A4.3': 10, // A4.3.1 through A4.3.10 (HL only)
    'A4.4': 2  // A4.4.1 through A4.4.2
  },
  'B1': {
    'B1.1': 4  // B1.1.1 through B1.1.4
  },
  'B2': {
    'B2.1': 4, // B2.1.1 through B2.1.4
    'B2.2': 4, // B2.2.1 through B2.2.4
    'B2.3': 4, // B2.3.1 through B2.3.4
    'B2.4': 5, // B2.4.1 through B2.4.5
    'B2.5': 1  // B2.5.1
  },
  'B3': {
    'B3.1': 5, // B3.1.1 through B3.1.5
    'B3.2': 5  // B3.2.1 through B3.2.5 (HL only)
  },
  'B4': {
    'B4.1': 6  // B4.1.1 through B4.1.6 (HL only)
  }
};

// Lesson titles from the IB syllabus
const lessonTitles = {
  'A1.1.1': 'Describe the functions and interactions of the main CPU components',
  'A1.1.2': 'Describe the role of a GPU',
  'A1.1.3': 'Explain the differences between the CPU and the GPU (HL only)',
  'A1.1.4': 'Explain the purposes of different types of primary memory',
  'A1.1.5': 'Describe the fetch, decode and execute cycle',
  'A1.1.6': 'Describe the process of pipelining in multi-core architectures (HL only)',
  'A1.1.7': 'Describe internal and external types of secondary memory storage',
  'A1.1.8': 'Describe the concept of compression',
  'A1.1.9': 'Describe the different types of services in cloud computing',
  
  'A1.2.1': 'Describe the principal methods of representing data',
  'A1.2.2': 'Explain how binary is used to store data',
  'A1.2.3': 'Describe the purpose and use of logic gates',
  'A1.2.4': 'Construct and analyse truth tables',
  'A1.2.5': 'Construct logic diagrams',
  
  'A1.3.1': 'Describe the role of operating systems',
  'A1.3.2': 'Describe the functions of an operating system',
  'A1.3.3': 'Compare different approaches to scheduling',
  'A1.3.4': 'Evaluate the use of polling and interrupt handling',
  'A1.3.5': 'Explain the role of the operating system in managing multitasking and resource allocation (HL only)',
  'A1.3.6': 'Describe the use of the control system components (HL only)',
  'A1.3.7': 'Explain the use of control systems in a range of real-world applications (HL only)',
  
  'A1.4.1': 'Evaluate the translation processes of interpreters and compilers (HL only)',
  
  // A2 Network titles
  'A2.1.1': 'Describe the purpose and characteristics of networks',
  'A2.1.2': 'Describe the purpose, benefits and limitations of modern digital infrastructures',
  'A2.1.3': 'Describe the function of network devices',
  'A2.1.4': 'Describe the network protocols used for transport and application',
  'A2.1.5': 'Describe the function of the TCP/IP model (HL only)',
  
  'A2.2.1': 'Describe the functions and practical applications of network topologies',
  'A2.2.2': 'Describe the function of servers (HL only)',
  'A2.2.3': 'Compare and contrast networking models',
  'A2.2.4': 'Explain the concepts and applications of network segmentation',
  
  'A2.3.1': 'Describe different types of IP addressing',
  'A2.3.2': 'Compare types of media for data transmission',
  'A2.3.3': 'Explain how packet switching is used to send data across a network',
  'A2.3.4': 'Explain how static routing and dynamic routing move data across local area networks (HL only)',
  
  'A2.4.1': 'Discuss the effectiveness of firewalls at protecting a network',
  'A2.4.2': 'Describe common network vulnerabilities (HL only)',
  'A2.4.3': 'Describe common network countermeasures (HL only)',
  'A2.4.4': 'Describe the process of encryption and digital certificates',
  
  // A3 Database titles
  'A3.1.1': 'Explain the features, benefits and limitations of a relational database',
  
  'A3.2.1': 'Describe database schemas',
  'A3.2.2': 'Construct ERDs',
  'A3.2.3': 'Outline the different data types used in relational databases',
  'A3.2.4': 'Construct tables for relational databases',
  'A3.2.5': 'Explain the difference between normal forms',
  'A3.2.6': 'Construct a database normalized to 3NF for a range of real-world scenarios',
  'A3.2.7': 'Evaluate the need for denormalizing databases',
  
  'A3.3.1': 'Outline the differences between data language types within SQL',
  'A3.3.2': 'Construct queries between two tables in SQL',
  'A3.3.3': 'Explain how SQL can be used to update data in a database',
  'A3.3.4': 'Construct calculations within a database using SQL\'s aggregate functions (HL only)',
  'A3.3.5': 'Describe different database views (HL only)',
  'A3.3.6': 'Describe how transactions maintain data integrity in a database (HL only)',
  
  'A3.4.1': 'Outline the different types of databases as approaches to storing data (HL only)',
  'A3.4.2': 'Explain the primary objectives of data warehouses in data management and business intelligence (HL only)',
  'A3.4.3': 'Explain the role of online analytical processing (OLAP) and data mining for business intelligence (HL only)',
  'A3.4.4': 'Describe the features of distributed databases (HL only)',
  
  // A4 Machine Learning titles
  'A4.1.1': 'Describe the types of machine learning and their applications in the real world',
  'A4.1.2': 'Describe the hardware requirements for various scenarios where machine learning is deployed',
  
  'A4.2.1': 'Describe the significance of data cleaning (HL only)',
  'A4.2.2': 'Describe the role of feature selection (HL only)',
  'A4.2.3': 'Describe the importance of dimensionality reduction (HL only)',
  
  'A4.3.1': 'Explain how linear regression is used to predict continuous outcomes (HL only)',
  'A4.3.2': 'Explain how classifications techniques in supervised learning are used to predict discrete categorical outcomes (HL only)',
  'A4.3.3': 'Explain the role of hyperparameter tuning when evaluating supervised learning algorithms (HL only)',
  'A4.3.4': 'Describe how clustering techniques in unsupervised learning are used to group data based on similarities in features (HL only)',
  'A4.3.5': 'Describe how learning techniques using the association rule are used to uncover relations between different attributes in large data sets (HL only)',
  'A4.3.6': 'Describe how an agent learns to make decisions by interacting with its environment in reinforcement learning (HL only)',
  'A4.3.7': 'Describe the application of genetic algorithms in various real-world situations (HL only)',
  'A4.3.8': 'Outline the structure and function of ANNs and how multi-layer networks are used to model complex patterns in data sets (HL only)',
  'A4.3.9': 'Describe how CNNs are designed to adaptively learn spatial hierarchies of features in images (HL only)',
  'A4.3.10': 'Explain the importance of model selection and comparison in machine learning (HL only)',
  
  'A4.4.1': 'Discuss the ethical implications of machine learning in real-world scenarios',
  'A4.4.2': 'Discuss ethical aspects of the increasing integration of computer technologies into daily life',
  
  // B1 Computational Thinking titles
  'B1.1.1': 'Construct a problem specification',
  'B1.1.2': 'Describe the fundamental concepts of computational thinking',
  'B1.1.3': 'Explain how applying computational thinking to fundamental concepts is used to approach and solve problems in computer science',
  'B1.1.4': 'Trace flowcharts for a range of programming algorithms',
  
  // B2 Programming titles
  'B2.1.1': 'Construct and trace programs using a range of global and local variables of various data types',
  'B2.1.2': 'Construct programs that can extract and manipulate substrings',
  'B2.1.3': 'Describe how programs use common exception handling techniques',
  'B2.1.4': 'Construct and use common debugging techniques',
  
  'B2.2.1': 'Compare static and dynamic data structures',
  'B2.2.2': 'Construct programs that apply arrays and Lists',
  'B2.2.3': 'Explain the concept of a stack as a "last in, first out" (LIFO) data structure',
  'B2.2.4': 'Explain the concept of a queue as a "first in, first out" (FIFO) data structure',
  
  'B2.3.1': 'Construct programs that implement the correct sequence of code instructions to meet program objectives',
  'B2.3.2': 'Construct programs utilizing appropriate selection structures',
  'B2.3.3': 'Construct programs that utilize looping structures to perform repeated actions',
  'B2.3.4': 'Construct functions and modularization',
  
  'B2.4.1': 'Describe the efficiency of specific algorithms by calculating their Big O notation to analyse their scalability',
  'B2.4.2': 'Construct and trace algorithms to implement a linear search and a binary search for data retrieval',
  'B2.4.3': 'Construct and trace algorithms to implement bubble sort and selection sort, evaluating their time and space complexities',
  'B2.4.4': 'Explain the fundamental concept of recursion and its applications in programming (HL only)',
  'B2.4.5': 'Construct and trace recursive algorithms in a programming language (HL only)',
  
  'B2.5.1': 'Construct code to perform file-processing operations',
  
  // B3 OOP titles
  'B3.1.1': 'Evaluate the fundamentals of OOP',
  'B3.1.2': 'Construct a design of classes, their methods and behaviour',
  'B3.1.3': 'Distinguish between static and non-static variables and methods',
  'B3.1.4': 'Construct code to define classes and instantiate objects',
  'B3.1.5': 'Explain and apply the concepts of encapsulation and information hiding in OOP',
  
  'B3.2.1': 'Explain and apply the concept of inheritance in OOP to promote code reusability (HL only)',
  'B3.2.2': 'Construct code to model polymorphism and its various forms, such as method overriding (HL only)',
  'B3.2.3': 'Explain the concept of abstraction in OOP (HL only)',
  'B3.2.4': 'Explain the role of composition and aggregation in class relationships (HL only)',
  'B3.2.5': 'Explain commonly used design patterns in OOP (HL only)',
  
  // B4 ADT titles
  'B4.1.1': 'Explain the properties and purpose of ADTs in programming (HL only)',
  'B4.1.2': 'Evaluate linked lists (HL only)',
  'B4.1.3': 'Construct and apply linked lists: singly, doubly and circular (HL only)',
  'B4.1.4': 'Explain the structures and properties of BSTs (HL only)',
  'B4.1.5': 'Construct and apply sets as an ADT (HL only)',
  'B4.1.6': 'Explain the core principles of ADTs (HL only)',
};

console.log('Creating IB Computer Science lesson directory structure...\n');

let created = 0;
let skipped = 0;

for (const [unit, subtopics] of Object.entries(structure)) {
  for (const [subtopic, lessonCount] of Object.entries(subtopics)) {
    for (let i = 1; i <= lessonCount; i++) {
      const lessonId = `${subtopic}.${i}`;
      const lessonPath = join(contentRoot, unit, subtopic, lessonId);
      const readmePath = join(lessonPath, 'README.md');
      
      try {
        mkdirSync(lessonPath, { recursive: true });
        
        // Only create README if it doesn't exist
        try {
          const title = lessonTitles[lessonId] || `Lesson ${lessonId}`;
          const content = `# ${lessonId}: ${title}

## Learning Objectives

> This lesson is part of the IB Computer Science curriculum.
> ${title.includes('(HL only)') ? '**Higher Level only**' : ''}

## Content

*Content will be added here.*

## Formative Assessment

*Assessment will be added here.*

## Resources

- IB Computer Science Guide
- Additional resources to be added
`;
          
          writeFileSync(readmePath, content, { flag: 'wx' }); // 'wx' fails if file exists
          console.log(`✓ Created ${lessonId}`);
          created++;
        } catch (err) {
          if (err.code === 'EEXIST') {
            console.log(`- Skipped ${lessonId} (already exists)`);
            skipped++;
          } else {
            throw err;
          }
        }
      } catch (err) {
        console.error(`✗ Error creating ${lessonId}:`, err.message);
      }
    }
  }
}

console.log(`\n✓ Complete! Created ${created} lessons, skipped ${skipped} existing lessons.`);

