# ProFlo Documentation 📐

**A comprehensive mineral processing flowsheet design software for visualizing, documenting, and validating your mineral processing operations.**

<img width="948" height="432" alt="landing page" src="https://github.com/user-attachments/assets/4cf42daf-231f-4067-9c7b-6ad59e009029" />


---

## Table of Contents

1. [🎯 What is ProFlo?](#what-is-proflo)
2. [📊 What is a Flowsheet?](#what-is-a-flowsheet)
3. [🚀 Getting Started](#getting-started)
   - [System Requirements](#system-requirements)
   - [Creating Your Account](#creating-your-account)
   - [Logging In](#logging-in)
   - [Password Recovery](#password-recovery)
4. [🏠 Understanding the Dashboard](#understanding-the-dashboard)
   - [Navigation Overview](#navigation-overview)
   - [Home View](#home-view)
   - [Recent View](#recent-view)
   - [Starred View](#starred-view)
   - [Quick Navigation Sidebar](#quick-navigation-sidebar)
   - [Searching Projects and Flowsheets](#searching-projects-and-flowsheets)
5. [📁 Working with Projects](#working-with-projects)
   - [What are Projects?](#what-are-projects)
   - [Creating a New Project](#creating-a-new-project)
   - [Viewing Project Details](#viewing-project-details)
   - [Managing Projects](#managing-projects)
6. [📋 Working with Flowsheets](#working-with-flowsheets)
   - [Creating a New Flowsheet](#creating-a-new-flowsheet)
   - [Using Flowsheet Footprints](#using-flowsheet-footprints)
   - [Managing Flowsheets](#managing-flowsheets)
7. [🎨 The Flowsheet Design Canvas](#the-flowsheet-design-canvas)
   - [Understanding the Interface](#understanding-the-interface)
   - [The Component Sidebar](#the-component-sidebar)
   - [The Canvas Workspace](#the-canvas-workspace)
8. [⬜ Working with Standard Shapes](#working-with-standard-shapes)
   - [Available Shapes](#available-shapes)
   - [Adding Shapes to Canvas](#adding-shapes-to-canvas)
   - [Shape Properties](#shape-properties)
   - [Using Text Components](#using-text-components)
9. [⚙️ Working with Components](#working-with-components)
   - [Component Categories](#component-categories)
   - [Adding Components to Canvas](#adding-components-to-canvas)
   - [Crusher Components](#crusher-components)
   - [Grinder Components](#grinder-components)
   - [Screener Components](#screener-components)
   - [Auxiliary Components](#auxiliary-components)
   - [Concentrator Components](#concentrator-components)
10. [🎨 Custom Components](#custom-components)
    - [Creating Custom Components](#creating-custom-components)
    - [Image Requirements](#image-requirements)
    - [Managing Custom Components](#managing-custom-components)
11. [🔗 Connectors - The Backbone of Your Design](#connectors---the-backbone-of-your-design)
    - [What are Connectors?](#what-are-connectors)
    - [Understanding Connector Parts](#understanding-connector-parts)
    - [Creating Connections](#creating-connections)
    - [Valid vs Invalid Connections](#valid-vs-invalid-connections)
    - [Working with Polylines](#working-with-polylines)
    - [Connection Rules and Validation](#connection-rules-and-validation)
12. [🖱️ Interacting with Your Design](#interacting-with-your-design)
    - [Selecting Elements](#selecting-elements)
    - [Moving Components](#moving-components)
    - [Viewing Component Information](#viewing-component-information)
    - [Working with Overlapping Elements](#working-with-overlapping-elements)
13. [💾 Saving Your Work](#saving-your-work)
    - [Manual Save](#manual-save)
    - [Auto Save](#auto-save)
    - [Understanding Save Status](#understanding-save-status)
14. [🧮 Utility Features](#utility-features)
    - [Bond's Energy Calculation](#bonds-energy-calculation)
    - [Understanding the Calculation](#understanding-the-calculation)
    - [How to Calculate Bond's Energy](#how-to-calculate-bonds-energy)
15. [📤 Exporting Your Work](#exporting-your-work)
    - [PNG Export](#png-export)
    - [PDF Report Export](#pdf-report-export)
    - [What's Included in Reports](#whats-included-in-reports)
16. [✨ Best Practices](#best-practices)
17. [⚠️ Current Limitations](#current-limitations)
18. [💬 We Want Your Feedback!](#we-want-your-feedback)
19. [❓ Frequently Asked Questions](#frequently-asked-questions)
20. [🆘 Support](#support)

---

## What is ProFlo?

ProFlo is a **mineral processing design software** built for engineers, students, and professionals working in the mineral processing industry. Whether you're designing a new processing plant, documenting an existing operation, or learning about mineral processing workflows, ProFlo helps you:

- **Design** flowsheets visually with an intuitive drag-and-drop interface
- **Visualize** mineral processing operations with industry-standard components
- **Validate** your designs with built-in connection logic and equipment compatibility checks
- **Calculate** Bond's Work Index energy requirements for comminution processes
- **Document** your work with professional reports suitable for project documentation and engineering reviews
- **Export** your designs as images and comprehensive PDF reports

![ProFlo Features Overview](./docs/images/features-overview.png)

---

## What is a Flowsheet?

A **flowsheet** is a visual diagram that shows the sequence of operations in mineral processing. Think of it as a roadmap that documents how raw ore flows through various equipment stages - from initial crushing, through grinding and screening, to final concentration and product recovery.

In the mineral processing industry, flowsheets are essential for:

- **Planning** new processing facilities
- **Documenting** existing operations
- **Communicating** process designs to team members and stakeholders
- **Analyzing** material flow and equipment requirements
- **Optimizing** processing efficiency

Every operation and piece of equipment in your flowsheet should be carefully documented - ProFlo makes this easy by requiring descriptions for each component and connection, ensuring your flowsheet serves as comprehensive technical documentation.

<img width="830" height="666" alt="Copper_Processing_Flowsheet" src="https://github.com/user-attachments/assets/b3a7e73e-0bd4-4a2a-a003-2ad70143a7d8" />


---

## Getting Started

### System Requirements

**Important:** ProFlo is currently a **desktop-only application**.

- **Supported:** Desktop browsers (Chrome, Firefox, Safari, Edge)
- **Not Supported:** Mobile devices and tablets

We recommend using ProFlo on a desktop or laptop computer for the best experience.

### Creating Your Account

Getting started with ProFlo is easy! You have two options for creating your account:

**Option 1: Sign up with Email**

1. Visit the ProFlo landing page and click **"Sign Up"** or **"Create Account"**
2. Enter your email address
3. Create a password (minimum 8 characters)
4. Confirm your password
5. Click **"Register Account"**

<img width="814" height="437" alt="sign up" src="https://github.com/user-attachments/assets/4718a889-8823-4d2e-81f9-36d579b4b8b7" />


**Option 2: Sign up with Google**

1. Click **"Continue with Google"**
2. Select your Google account
3. Authorize ProFlo to access your account
4. You're in!

**Important Notes:**

- **Email Validation:** ProFlo doesn't verify if your email is valid during signup. However, if you need to reset your password later, the reset link will be sent to your email address - so we recommend using a valid email you can access.
- **Password Requirements:** Passwords must be at least 8 characters long. There's no requirement for special characters or numbers, but we recommend using a strong password to keep your account secure.

### Logging In

Once you've created your account, logging in is simple:

1. Go to the ProFlo login page
2. Choose your login method:
   - **Email/Password:** Enter your credentials and click **"Login Account"**
   - **Google OAuth:** Click **"Continue with Google"** and select your account
3. You'll be taken to your dashboard

<img width="944" height="437" alt="login page" src="https://github.com/user-attachments/assets/8920f39c-bf4e-4ec7-b9a4-41645188ebb5" />


### Password Recovery

Forgot your password? No problem!

1. On the login page, click **"Forgot password"**
2. Enter the email address you used to sign up
3. Check your email for the password reset link
4. Click the link and create a new password
5. Log in with your new password

**Note:** This is why we recommend using a valid email address during signup!

---

## Understanding the Dashboard

Your dashboard is home base in ProFlo. This is where you'll manage all your projects and flowsheets, access recent work, and start new designs.

<img width="952" height="436" alt="normal dashboard view" src="https://github.com/user-attachments/assets/09830449-749c-4281-b101-0203dcb396cc" />


### Navigation Overview

The dashboard has two main sections:

**Left Sidebar:**
- **Navigation tabs:** Home, Recents, Starred
- **Quick access:** Your most recently opened projects and flowsheets
- **Category toggle:** Switch between viewing Projects or Flowsheets

**Main Content Area:**
- **Quick Actions:** Create new flowsheets or projects
- **Content view:** All your projects/flowsheets with thumbnails and details
- **Search bar:** Find specific projects or flowsheets quickly

### Home View

The **Home** tab shows all your projects and flowsheets in one place. You can toggle between two views:

**Flowsheets View:**
- Shows all your flowsheets across all projects
- Displays a thumbnail preview of each flowsheet (your last saved design)
- Shows flowsheet name, edit date, and star status
- Click **"Open »"** to jump into the design canvas

**Projects View:**
- Shows all your projects
- Displays a preview of the most recently edited flowsheet in each project
- Shows project name, edit date, and star status
- Click **"Open »"** to view project details and all flowsheets within it

<img width="741" height="405" alt="preview page" src="https://github.com/user-attachments/assets/ff2b80be-bc78-4741-9c9c-5424a8d82b20" />



**Pagination:** If you have many projects or flowsheets, they'll be organized across multiple pages for easier browsing.

### Recent View

The **Recents** tab shows your most recently edited work. Like the Home view, you can toggle between:

- **Recent Flowsheets:** Your most recently opened or edited flowsheets
- **Recent Projects:** Your most recently accessed projects

This is perfect for quickly jumping back to what you were working on!


### Starred View

The **Starred** tab shows items you've marked as important. Star your most critical designs for quick access:

- **Starred Flowsheets:** Flowsheets you've marked with a star
- **Starred Projects:** Projects you've marked as favorites

To star an item, just click the star icon on any flowsheet or project card.

### Quick Navigation Sidebar

At the bottom of the left sidebar, you'll see a dropdown toggle (Projects/Flowsheets) that shows your **top 5 most recently opened items**. This serves as a quick navigation menu - click any item to jump directly to it without searching.

<img width="208" height="205" alt="quick access to flowsheet" src="https://github.com/user-attachments/assets/5e3c69cd-d9ee-46ac-b33b-fb1bba6da418" />


### Searching Projects and Flowsheets

Looking for something specific? Use the search bar at the top of the dashboard:

1. Type your search term (project name, flowsheet name, or keywords)
2. ProFlo searches across both projects and flowsheets
3. Results appear grouped by category:
   - **Projects** section
   - **Flowsheets** section
4. Click any result to open it

<img width="395" height="215" alt="search result" src="https://github.com/user-attachments/assets/50599bdb-da70-4597-9a19-ef3737696c2f" />


---

## Working with Projects

### What are Projects?

Think of **Projects** as folders for organizing your flowsheets. A project is a container that groups related flowsheets together.

For example:
- **"Granite Quarry Expansion"** project might contain multiple flowsheets for different processing scenarios
- **"Gold Processing Plant Design"** project might have flowsheets for primary, secondary, and tertiary processing stages
- **"University Coursework"** project might contain flowsheets for different assignments

**Why use projects?**
- Keep related flowsheets organized in one place
- Document the overall purpose and scope
- Easily switch between different scenarios or design iterations
- Better project management and documentation

### Creating a New Project

You can create a project in two ways:

**Method 1: From the Dashboard**

1. Click the **"New Project"** button in the Quick Actions section
2. Fill in the project details:
   - **Project Name** (required): Give your project a clear, descriptive name
   - **Description** (required): Describe the project's purpose, scope, or any important context
3. Click **"Create Project"**

<img width="960" height="405" alt="new project page" src="https://github.com/user-attachments/assets/0fe48aee-4a92-4f7b-b987-52fd71d918db" />


**Method 2: From the Projects List**

1. Click **"Project List"** in the top right corner of the dashboard
2. Click **"Create New Project"** button
3. Fill in the details and create your project

**Important:** Both name and description are required fields. ProFlo emphasizes documentation, so every project should have clear context about its purpose.

### Viewing Project Details

When you open a project, you'll see:

**Project Information Panel (Right Side):**
- Project name
- Project description
- Last edited date
- Number of flowsheets in the project

**Preview Section (Left Side):**
- Large preview of the most recently edited flowsheet in this project
- Shows your actual design, so you can see at a glance what you've been working on

**Flowsheets Section (Bottom):**
- Grid of all flowsheets belonging to this project
- Each card shows a thumbnail, name, edit date, and star status
- Click **"Open »"** on any flowsheet to start editing

<img width="941" height="439" alt="project detail page" src="https://github.com/user-attachments/assets/a3b1e396-a73b-4746-ba56-688d83ff6080" />


**Adding Flowsheets:** Click **"Add new flowsheet"** to create a new flowsheet within this project (more on this in the next section).

### Managing Projects

Each project card has a **three-dot menu** (⋮) with options:

- **Edit:** Modify project name or description
- **Delete:** Permanently remove the project and all its flowsheets (use with caution!)
- **Share:** Copy a shareable URL to the project


<img width="1370" height="594" alt="image" src="https://github.com/user-attachments/assets/361064e5-f839-4494-bd2f-779c7970e9d7" />


**Note:** All project properties (name, description) are **locked after creation**. If you need to make changes, you'll need to delete and recreate the project. This is an intentional design decision to maintain documentation integrity.

---

## Working with Flowsheets

### Creating a New Flowsheet

Flowsheets always belong to a project - they can't exist on their own. This keeps your work organized! There are two ways to create a flowsheet:

**Method 1: From the Dashboard**

1. Click **"New Flowsheet"** in the Quick Actions section
2. A dropdown appears: **"Choose Project"**
3. Select the project where you want to create the flowsheet
4. You'll be taken to the flowsheet creation form

<img width="282" height="166" alt="add flowsheet on dashboard page" src="https://github.com/user-attachments/assets/14ab9147-bb99-485a-b976-6f743caea7a7" />


**Method 2: From Within a Project**

1. Open a project
2. Click **"Add new flowsheet"** button
3. The project is automatically selected for you

**Flowsheet Creation Form:**

Fill in the following details:

- **Flowsheet Name** (required): A clear, descriptive name for this flowsheet
- **Description** (required): Describe what this flowsheet represents, its purpose, or any important notes
- **Flowsheet Footprint** (optional): Choose an existing flowsheet to use as a template (see next section)

<img width="960" height="443" alt="create flowsheet page" src="https://github.com/user-attachments/assets/03721351-59de-48aa-a22d-d788bdde0db2" />


Click **"Create Flowsheet"** and you'll be taken directly to the design canvas!

### Using Flowsheet Footprints

Here's a powerful time-saving feature: **Flowsheet Footprints** let you create a new flowsheet based on an existing one.

**When to use footprints:**
- You have a flowsheet and want to create a variant with minor changes
- You're exploring different scenarios (what if we use a different crusher?)
- You want to maintain a similar layout but adjust equipment specifications

**How it works:**

1. When creating a new flowsheet, click the **"Flowsheet Footprint"** dropdown
2. Select an existing flowsheet from the list
3. Click **"Create Flowsheet"**
4. Your new flowsheet opens with an exact copy of the selected flowsheet's design
5. Make your modifications and save

**Example:** You have a flowsheet called "Primary Crushing - Option A" with a jaw crusher. You want to explore using a gyratory crusher instead. Create a new flowsheet with "Option A" as the footprint, swap the crusher, and save it as "Primary Crushing - Option B". Both designs are now documented separately!

<img width="623" height="234" alt="footprint-examples" src="https://github.com/user-attachments/assets/b5472724-37db-4d48-a607-48af5a35dc37" />

You have access to footprints of all flowsheets across all the projects on your dashboard


### Managing Flowsheets

Like projects, each flowsheet card has a **three-dot menu** (⋮) with options:

- **Edit:** Update flowsheet name or description (Note: This is locked after creation - see important note below)
- **Delete:** Permanently remove the flowsheet
- **Share:** Copy a shareable URL to the flowsheet

<img width="744" height="257" alt="edit-card" src="https://github.com/user-attachments/assets/82f27797-eb61-4d37-9687-621f36fa51e7" />

**Important Note on Editing:** Once you create a flowsheet and set its properties (name, description), these are **permanently locked**. You cannot edit them later. This is an intentional design decision to ensure documentation integrity - once an operation is defined and saved, its documentation shouldn't change arbitrarily.

If you need to make changes, delete the flowsheet and create a new one (or use the footprint feature to copy it first).

---

## The Flowsheet Design Canvas

This is where the magic happens! The design canvas is your workspace for creating mineral processing flowsheets.

<img width="956" height="433" alt="flowsheet design page" src="https://github.com/user-attachments/assets/b30405c9-dd3f-42dc-b8bf-4973c9df8361" />


### Understanding the Interface

The canvas interface has several key areas:

**Top Navigation Bar:**
- **Breadcrumb:** Shows Project Name > Flowsheet Name
- **Save Status:** Displays "saved", "save", or "saving..." 
- **Utility Dropdown:** Access Bond's energy calculator and other tools
- **Export Button:** Download your flowsheet as PNG and PDF
- **User Profile:** Access account settings

**Left Sidebar - Component Panel:**
- **Search Components:** Find specific components quickly
- **Standard Shapes:** Basic drawing elements
- **Components:** Crushers, Grinders, Screeners, Auxiliaries, Concentrators
- **Personalized Objects:** Your custom uploaded components

**Main Canvas Area:**
- **Grid workspace:** Where you design your flowsheet
- **Zoom/Pan controls:** Navigate large designs
- **Infinite canvas:** No size limits!

### The Component Sidebar

The sidebar is organized into three collapsible sections:

**1. Standard**
Basic shapes for visual design and layout:
- Circle, Oval, Rectangle, Square
- Diamond, Triangle
- Arrow (for connectors)
- Text (for labels and annotations)

**2. Components**
Industry-specific mineral processing equipment, organized by function:
- **Crushers:** Primary, secondary, and tertiary crushing equipment
- **Grinders:** Milling and fine grinding equipment
- **Screeners:** Particle size classification equipment
- **Auxiliaries:** Support equipment (ore bins, stockpiles, hoppers, nodes)
- **Concentrators:** Ore enrichment and separation equipment

**3. Personalized Objects**
Your custom-uploaded components appear here, and also shows in the component category they belong.

<img width="467" height="792" alt="image" src="https://github.com/user-attachments/assets/4e46571d-952a-44bb-9c61-f780c47bbf94" />



### The Canvas Workspace

The canvas is a **gridded workspace** where you'll build your flowsheet. Here's what you can do:

- **Drag and drop** components from the sidebar
- **Connect components** with lines to show material flow
- **Move and arrange** elements freely
- **Zoom in/out** for detail work or big-picture view
- **Pan** across large designs

The grid helps you align components neatly, but you're free to place items anywhere you like!

---

## Working with Standard Shapes

Standard shapes are the building blocks for visual design. While they don't have the specialized properties of components, they're incredibly useful for layout and documentation.

### Available Shapes

ProFlo provides these standard shapes:

- **Circle** and **Oval:** For nodes, decision points, or visual emphasis
- **Rectangle** and **Square:** For grouping, boundaries, or annotations
- **Diamond:** For decision points or special operations
- **Triangle:** For directional flow or special indicators
- **Arrow:** For directional indicators (note: different from connector lines!)
- **Text:** For labels, notes, and descriptions

<img width="460" height="200" alt="image" src="https://github.com/user-attachments/assets/118a739f-c030-4248-bafe-47e001cead57" />


### Adding Shapes to Canvas

Adding shapes is simple:

1. **Click and drag** the shape from the sidebar
2. You'll see a **faint copy** of the shape following your mouse cursor
3. **Drop it** anywhere on the canvas (the grid area)
4. A **properties dialog** appears immediately

![Adding Shape Demo](./docs/videos/add-shape-demo.gif)

**Drop Zone:** You can only drop shapes on the canvas (the grid workspace). The sidebar and other UI areas won't accept drops.

### Shape Properties

When you drop a shape on the canvas, you'll be prompted to set its properties:

**For Most Shapes:**
- **Label** (required): A name or identifier for this shape
- **Description** (required): Describe what this shape represents or its purpose in your flowsheet

<img width="409" height="240" alt="shape property" src="https://github.com/user-attachments/assets/4b54057e-45b0-4a81-b5c4-26d8ff7520ae" />


**Why required?** Remember, ProFlo is a documentation tool. Every element in your flowsheet should have a clear purpose and description. This ensures your flowsheet serves as comprehensive technical documentation for field implementation.

**Example:** You use a rectangle to represent a "Surge Bin" between crushing stages:
- **Label:** "Surge Bin A"
- **Description:** "500-ton capacity surge bin between primary and secondary crushing"

**Important:** Once you save the properties, they're **permanently locked**. You cannot edit them later. If you need to make changes, delete the shape and add a new one.

**Note:** To delete an element on the canvas, click on the element and press the backspace or delete key on the keyboard

### Using Text Components

The **Text** component is special - it's the only shape that doesn't require label and description properties.

**How to use text:**

1. Drag the "T" (Text) component from the sidebar
2. Drop it on the canvas
3. A text input dialog appears
4. Type your text
5. Click outside or press Enter to save

**Use cases for text:**
- Annotate your flowsheet with notes
- Label groups of equipment
- Add specifications or callouts
- Indicate equipment quantities (e.g., "4 units")

<img width="368" height="265" alt="image" src="https://github.com/user-attachments/assets/186d9250-c2e3-4dd4-97f2-4c7565ad6b59" />

**Note:** To delete a text component, clear the text in it, then press the backspace button on your keyboard when the text box is empty.

**Pro Tip:** When you have multiple identical pieces of equipment (e.g set of crushers in a primary crushing unit), use one component to represent the specification and add a text element saying "x4 units" or "4 parallel trains" to indicate quantity. This keeps your documentation clear while avoiding cluttered diagrams.

---

## Working with Components

Components are the heart of ProFlo - these are specialized mineral processing equipment with properties, validation rules, and calculation capabilities.

### Component Categories

ProFlo organizes components into five categories based on their function in mineral processing:

1. **Crushers** - Size reduction equipment for coarse crushing
2. **Grinders** - Size reduction equipment for fine grinding/milling
3. **Screeners** - Particle size separation and classification
4. **Auxiliaries** - Supporting equipment (ore storage, bins, hoppers, nodes)
5. **Concentrators** - Ore enrichment and beneficiation equipment

Each category appears as a button in the Components section of the sidebar.

<img width="481" height="300" alt="image" src="https://github.com/user-attachments/assets/5d84ae38-7e67-4f69-acba-7eb960e83659" />


### Adding Components to Canvas

The process for adding components is the same as shapes:

1. **Click the category button** to see available components
2. **Drag a component** from the list
3. **Drop it** on the canvas
4. A **properties dialog** appears - this is where components differ from shapes!

Each component type has its own specific properties based on its function in mineral processing. Let's look at each one:

### Crusher Components

Crushers handle the initial stages of size reduction - breaking down large ore into smaller pieces.

<img width="463" height="800" alt="image" src="https://github.com/user-attachments/assets/156bde74-779b-4e24-b9cd-67f3b60db4b2" />


**When you add a crusher, you'll set these properties:**

- **Label** (required): A name for this crusher (e.g., "Primary Jaw Crusher", "Gyratory 1")
- **Gape in mm** (required): The maximum opening size - the largest ore particle that can enter the crusher
- **Set in mm** (required): The closed side setting - the product size after crushing
- **Crusher Type** (required): Select one:
  - **Primary** - First stage crushing (largest gape, typically one per flowsheet)
  - **Secondary** - Second stage crushing (medium reduction)
  - **Tertiary** - Third stage crushing (fine reduction)
- **Description** (required): Describe this crushing operation

<img width="434" height="374" alt="crusher property" src="https://github.com/user-attachments/assets/e62dd00f-cf4f-4a4e-b5c6-7678c39959c6" />

**Important Rules:**

**Primary Crusher Restriction:** You can only have **one Primary crusher** in your flowsheet. This reflects real-world mineral processing design principles - all primary crushers in an operation must have the same gape size to ensure consistent feed processing.

**What if I need multiple primary crushers?** In large operations, you might have multiple primary crushers running in parallel. In ProFlo, represent this by:
1. Creating one primary crusher with the correct specifications
2. Using a **Text component** to annotate: "4 units in parallel" or "x3 primary crushers"


**Future Enhancement:** We're considering allowing multiple primary crushers with matching gape/set specifications. [Share your feedback](#we-want-your-feedback) on this!

**Understanding Gape and Set:**
- **Gape:** Maximum input size (feed size the crusher can accept)
- **Set:** Output size (product size after crushing)
- These values are critical for validation - ProFlo checks that upstream ore size matches downstream crusher capacity!

### Grinder Components

Grinders (also called mills) handle finer size reduction - typically after crushing, breaking ore into smaller particles for concentration.

**Grinder properties are similar to crushers:**

- **Label** (required): Name for this grinder (e.g., "Ball Mill 1", "SAG Mill")
- **Gape in mm** (required): Maximum feed size the grinder can accept
- **Set in mm** (required): Product size after grinding
- **Description** (required): Describe this grinding operation

<img width="1294" height="724" alt="image" src="https://github.com/user-attachments/assets/190fd624-87ac-4ed5-97ff-b9946141ba88" />


**Key Difference from Crushers:** Grinders don't have Primary/Secondary/Tertiary designation. Most milling operations occur in the tertiary (fine reduction) stage, so the classification isn't necessary.

### Screener Components

Screeners (also called screens or sizers) separate particles by size - classifying ore into different size fractions.

**Screener properties:**

- **Label** (required): Name for this screener (e.g., "Grizzly Screen", "Vibrating Screen A")
- **Screener Aperture in mm** (required): The screen opening size - particles smaller than this pass through (undersize), larger particles are retained (oversize)
- **Description** (required): Describe this screening operation

<img width="1128" height="689" alt="image" src="https://github.com/user-attachments/assets/ad8320c8-e320-4b13-8181-eb8db082564e" />

**Current Limitation:** In Version 1, ProFlo only tracks **undersize output** (particles that pass through the screen). In real operations, screeners have two outputs:
- **Undersize** - passes through the screen
- **Oversize** - retained on the screen

This is a known limitation we're working to improve. For now, when designing with screeners, note in the description which stream (undersize or oversize) you're tracking.

**Workaround:** Use a screener with an aperture size equal to or larger than your ore size to ensure the material "passes through" for validation purposes.

[We'd love your feedback](#we-want-your-feedback) on how to best handle dual screener outputs!

### Auxiliary Components

Auxiliaries are supporting equipment that don't perform size reduction or separation, but are essential to the process flow.


**Types of Auxiliaries:**

ProFlo recognizes several auxiliary subtypes, but currently, only **ORE** types have custom properties. Other types (stockpiles, bins, hoppers, tailing facilities, nodes) require only label and description no additional properties required to use them on the design canvas.

**ORE Auxiliary Properties:**

Ore auxiliaries represent feed material - typically dump trucks, conveyor feeds, or ore stockpiles entering the process.

- **Label** (required): Name for this ore source (e.g., "Dump Truck A", "Primary Feed")
- **Max. Size in mm** (required): Maximum diameter/width of ore particles
- **Grade** (required): Ratio of valuable mineral in the ore (e.g., 0.45 means 45% valuable material)
- **Quantity in metric tons** (required): Total ore mass
- **Description** (required): Describe this ore feed

<img width="329" height="321" alt="aux-ore property" src="https://github.com/user-attachments/assets/25ab4cf7-37ad-4efe-a68a-d18ff0f250cd" />


**Why Ore Properties Matter:**
- **Max Size:** Used to validate crusher gape compatibility - ensures your crusher can handle the feed!
- **Grade & Quantity:** Used in concentrator calculations to determine valuable mineral recovery
- These properties **propagate through your flowsheet** as ore moves between operations

**Other Auxiliary Types:**

For stockpiles, bins, hoppers, and other auxiliaries, you'll only set:
- **Label** (required)
- **Description** (required)

**Special Auxiliary: Nodes**

Nodes are junction points where multiple streams combine or split. Use them to:
- Combine multiple input streams into one output
- Split one stream into multiple paths
- Create complex flow networks

<img width="1142" height="507" alt="image" src="https://github.com/user-attachments/assets/46a242a5-fecc-4a6a-90ea-36cd77b95a6a" />


**Note:** By default you might not have a node component in your flowsheet components, you can always create yours by importing see [Custom Components](#custom-components)

### Concentrator Components

Concentrators perform beneficiation - separating valuable minerals from waste (gangue) through various methods like flotation, gravity separation, or magnetic separation.

**Concentrator properties:**

- **Label** (required): Name for this concentrator (e.g., "Flotation Cell 1", "Magnetic Separator")
- **Quantity in metric tons** (required): Feed ore quantity (default/fallback value)
- **Grade** (required): Feed ore grade (default/fallback value)
- **Description** (required): Describe this concentration operation

<img width="441" height="356" alt="concentrator property" src="https://github.com/user-attachments/assets/627445fb-47e2-40b8-bace-770f8425c429" />


**How Concentrators Work:**

Concentrators are "smart" - they can use properties from upstream operations or fall back to your manual input:

**Default Values (Your Input):**
- The quantity and grade you enter serve as default values
- If the concentrator isn't connected to an upstream ore feed, it uses these values

**Inherited Values (From Connections):**
- If connected to an upstream ore feed or component with ore properties, the concentrator automatically uses those values

**Why This Matters:** As ore moves through your process (crushing, grinding, transport), some material is lost and the grade may change. By allowing concentrators to inherit upstream values, ProFlo gives you more accurate calculations at the concentration stage.

**Mass Balance Calculations:**

When you hover over a connected concentrator, ProFlo displays complete mass balance calculations:

- Feed composition (% valuable, % gangue)
- Recovery criteria (what % of valuable/gangue the concentrator recovers)
- **Concentrate output** (product - valuable mineral + some gangue)
- **Waste output** (tailings - removed gangue + lost valuable mineral)
- Confirmation that mass balance is maintained!

<img width="305" height="368" alt="concentrator tooltip after connection" src="https://github.com/user-attachments/assets/92d0cc70-b086-4d69-aa16-56abb24b2d7e" />


**Example:**
```
Feed: 5000 tons, Grade 0.6 (60% valuable, 40% gangue)
Recovery: 70% valuable, 30% gangue

Concentrate:
- Valuable: 2100 tons
- Gangue: 1400 tons
Total: 3500 tons

Waste:
- Valuable: 900 tons (lost)
- Gangue: 600 tons (removed)
Total: 1500 tons

Total: 5000 tons ✓ (mass balance maintained)
```

---

## Custom Components

Don't see the component you need in the library? No problem! ProFlo lets you upload your own custom components with images and properties.

### Creating Custom Components

Custom components can belong to any of the five component categories:
- Crusher
- Grinder
- Screener
- Auxiliary
- Concentrator

**How to add a custom component:**

1. In the **Personalized Objects** section of the sidebar, click the **"Drop custom component here"** area
2. A dialog appears: **"Custom Component"**
3. Fill in the details based on component type:

<img width="821" height="359" alt="custom component upload" src="https://github.com/user-attachments/assets/3fd56675-d56e-4ce5-9828-b7b9d19713fa" />

<img width="421" height="383" alt="custom component options" src="https://github.com/user-attachments/assets/50d52780-27c0-42f2-b255-81cb493c9f4e" />

**For All Component Types:**

- **Component Label** (required): What you want to call this component
- **Component Type** (dropdown): Select the category
- **Component Image** (required): Upload an image (click or drag-and-drop)

**Additional Fields by Type:**

**For Crushers/Grinders:**
- Just the image and label - no additional fields needed

**For Screeners:**
- Just the image and label - no additional fields needed

**For Concentrators:**
- **Description** (required)
- **Recovery Criteria:**
  - **valuable (%)**: Percentage of valuable mineral this concentrator can recover
  - **gangue (%)**: Percentage of gangue/waste this concentrator can recover/remove

<img width="337" height="361" alt="concentrator" src="https://github.com/user-attachments/assets/b740b4c5-862d-45b6-ac20-21e0f657283a" />


**For Auxiliaries:**
- **Description** (required)
- **Sub-type** (dropdown): Select the auxiliary type:
  - **ore** - Requires ore properties (max size, grade, quantity)
  - **STORAGE FACILITY** - Includes stockpile, bins
  - **Tailing Facility**
  - **others**

<img width="367" height="379" alt="auxilliary custom component options" src="https://github.com/user-attachments/assets/3066a39f-5be6-43fd-b477-4d483991eb8e" />


4. Click **"Create"** and your component appears in the Personalized Objects section!

**Where Your Component Appears:**

Once created, your custom component shows up in **two places**:
1. **Personalized Objects section** - For easy access to all your custom components
2. **The relevant category** - For example, a custom crusher also appears in the Crushers section


### Image Requirements

**Image Upload:**
- **Format:** PNG recommended for best quality (other formats supported)
- **Resolution:** Use good resolution images for crisp display
- **Size:** Under 2MB recommended (larger files may fail or take excessive time to upload)
- **Background:** Non-PNG images are automatically processed to remove backgrounds for cleaner canvas appearance

**Scaling:**
- Images are automatically scaled to 60×60 pixels (or proportional, up to max 100px)
- Aspect ratio is preserved
- Don't worry about exact sizing - ProFlo handles it!

**Pro Tips:**
- Use clear, recognizable equipment icons or photos
- PNG with transparent background looks best on the canvas
- Higher resolution = better quality when scaled
- Keep file size reasonable for faster uploads

### Managing Custom Components

Each custom component in the Personalized Objects section has a **delete button** (trash icon). Click it to permanently remove a custom component.

**Note:** Deleting a custom component doesn't affect any flowsheets where you've already used it - those instances remain in your saved designs.

---

## Connectors - The Backbone of Your Design

Connectors (the arrow lines) are much more than visual elements - they're the intelligent backbone of ProFlo! Connectors track material flow, validate equipment compatibility, and ensure your flowsheet makes practical sense.

### What are Connectors?

In mineral processing, material flows from one operation to the next. Connectors represent this flow:

- Ore from a dump truck → into a crusher
- Crushed material → through a screener
- Screened undersize → to a grinder
- Ground material → to a concentrator

**But here's what makes ProFlo special:** Connectors aren't just lines. They're intelligent objects that:

✅ **Track connections** - Know what's before and after them  
✅ **Validate operations** - Check if connections make practical sense  
✅ **Propagate properties** - Pass ore size, grade, and quantity through the flowsheet  
✅ **Require documentation** - Every connector has a label and description

### Understanding Connector Parts

Every connector has **two main parts**:

**1. The Pivot (M-coordinate)** - The control point
- Marked by a circular indicator
- Identifies the **FROM** component (previous operation)
- Used to drag the entire line
- **Fixed** - cannot be extended

**2. The Arrow (L-coordinate)** - The extensible end
- Marked by an arrow head
- Identifies the **TO** component (next operation)
- Can be extended in any direction
- Can be broken into multiple segments (polyline)

<img width="163" height="248" alt="multi line point" src="https://github.com/user-attachments/assets/db2b6d1d-47bf-4e81-918b-eb4280e44d1a" />
<img width="113" height="67" alt="2 point line" src="https://github.com/user-attachments/assets/61f27661-eb6d-4df2-bcfd-381e539cd572" />


**Visual Representation:**
```
[Component A] ----M============>L---- [Component B]
               Pivot      Arrow
              (fixed)   (extensible)
```

### Creating Connections

There are **three ways** to connect components:

**Method 1: Drag Component to Line**

1. Add a connector to the canvas (drag the arrow from Standard shapes)
2. Properties dialog appears - set label and description
3. Drag a component close to either end of the line (within 10-15px)
4. The component **snaps into place** like a magnet!
5. Connection is made

![Drag Component to Line Demo](./docs/videos/drag-component-to-line.gif)

**Method 2: Drag Line to Component**

1. Add components to the canvas first
2. Add a connector
3. Drag either end of the line (pivot or arrow) close to a component
4. It snaps into place automatically
5. Connection is made

![Drag Line to Component Demo](./docs/videos/drag-line-to-component.gif)

**Method 3: Draw/Extend Line to Component**

1. Add a connector to the canvas
2. Click on the connector to activate it (you'll see indicator dots)
3. Click and drag the arrow endpoint
4. Extend it toward a component
5. When close enough (10-15px), it snaps into place
6. Connection is made

![Extend Line to Component Demo](./docs/videos/extend-line-to-component.gif)

**The Magic Magnet:** When a component and line are within close proximity of each other (usually 10-15 pixels) , ProFlo automatically "magnetizes" them together. You don't need pixel-perfect accuracy - just get close, and the system helps you make the connection!

**Exception:** The magnet doesn't activate if the line is already inside a component (they're already touching).

### Valid vs Invalid Connections

Here's where ProFlo gets smart. Not all connections are valid in real mineral processing operations!

**Connection Colors:**

- **Gray line** = Invalid or disconnected
- **Dark/colored line** = Valid connection

![Valid vs Invalid Connections](./docs/images/valid-invalid-connections.png)

**When is a connection invalid?**

❌ **Ore too large for crusher:**
- 500mm ore → 400mm gape crusher = **Invalid**
- The ore won't fit!

❌ **Violates 80/20 rule:**
- 200mm set crusher → 200mm gape crusher = **Invalid**
- Feed should be 20% smaller than gape (80% passing rule)
- 200mm set → 250mm+ gape = Valid ✓

❌ **Feed larger than screener aperture:**
- 600mm ore → 400mm aperture screener = **Invalid** (current limitation)
- In reality, oversize would be retained, but V1 only tracks undersize

❌ **No connection or disconnected:**
- Line floating on canvas with no components = **Gray**

**When is a connection valid?**

✅ **Feed size fits crusher gape** (with 80/20 rule)  
✅ **Feed size fits screener aperture**  
✅ **Component properties are compatible**  
✅ **Components properly connected at both ends**

**The 80/20 Rule (Comminution Best Practice):**

In mineral processing, the input ore should be approximately **20% smaller than the crusher gape** (80% passing). This ensures efficient crushing and prevents choking.

**Example:**
- Crusher with 1000mm gape
- Maximum feed size: 800mm (0.8 × 1000)
- A crusher with 900mm set feeding into it = Valid ✓
- A crusher with 950mm set feeding into it = Invalid ❌

ProFlo automatically applies this rule to validate crusher and grinder connections!

### Working with Polylines

Connectors don't have to be straight lines! You can create **polylines** (lines with multiple bend points) to route around other components or create clear flow paths.

**Creating Bend Points:**

1. Click a connector to activate it (indicator dots appear)
2. Find the **arrow endpoint** (the dot at the arrow head)
3. **Double-click that dot**
4. A new bend point is created!
5. Repeat to add more bend points

![Creating Polyline Demo](./docs/videos/create-polyline.gif)

**Moving Bend Points:**

1. Activate the connector (click it)
2. Click and drag any indicator dot (except the pivot)
3. The line segment bends as you move it
4. Release to set the new position

**Rules:**
- You can only create new bend points by double-clicking the **arrow endpoint**
- The **pivot point cannot be extended** or moved (it's the anchor)
- All other points can be dragged to reshape the line
- Lines can have unlimited bend points

**Use Cases for Polylines:**
- Route around other components for clarity
- Create complex flow networks
- Show recirculation loops
- Make your flowsheet more readable

<img width="552" height="337" alt="image" src="https://github.com/user-attachments/assets/ddb0c184-afb3-47a9-a621-cb46b9d3cca1" />


### Connection Rules and Validation

Let's recap the important connection rules:

**What Can Connect:**
✅ Lines can connect to **Components** (crushers, grinders, screeners, etc.)  
✅ Lines can connect to **Shapes** (for visual flow)  
✅ Components can have **multiple input lines** (multiple feeds)  
✅ Components can have **multiple output lines** (splitting flow)  
✅ Components can even **loop back to themselves** (recirculation)

**What Cannot Connect:**
❌ Lines cannot connect to **other lines**  
❌ Lines cannot connect to **Text elements**

**Property Propagation:**

When components connect, ProFlo automatically passes information downstream:

- **maxOreSize** propagates from crushers/grinders/screeners
- **oreGrade** and **oreQuantity** propagate from ore feeds
- Concentrators inherit these properties for accurate calculations

**Example Flow:**
```
Ore (900mm, grade 0.6, 5000 tons)
    ↓
Crusher (gape 1000mm, set 400mm)
    ↓ [maxOreSize now 400mm]
Screener (aperture 400mm)
    ↓ [maxOreSize still 400mm]
Concentrator (uses grade 0.6, quantity 5000 tons)
```

**Validation Scope (Current Limitation):**

ProFlo validates connections **only between the two directly connected components**. It doesn't cascade validation through the entire flowsheet chain.

**Why?** The system doesn't track a definitive "starting point" - users can build flowsheets in any order, add components anywhere, and create non-linear workflows. 

**Future Enhancement:** We're exploring a "Simulation Studio" feature where you'd specify start → end points, and ProFlo would validate the entire chain. [We'd love your feedback](#we-want-your-feedback) on this!

**Multiple Inputs (Current Limitation):**

If a component has multiple input lines with different properties, ProFlo uses the **most recently connected** input for property values. Your manually entered default values are retained as fallback.

**Best Practice:** When using multiple inputs, ensure they have compatible/matching properties (e.g., two crushers with the same set size feeding into one component).

---

## Interacting with Your Design

Once you've added components and connectors to your canvas, you'll need to interact with them - selecting, moving, viewing properties, and more.

### Selecting Elements

**For Components and Shapes:**

Click any component or shape to select it. When selected, you'll see:
- A **bounding rectangle** around the element
- **Corner handles** for resizing (drag corners to scale)
- The element is now "active" and ready to be moved or modified



<div>
<img width="201" height="219" alt="image" src="https://github.com/user-attachments/assets/cad9c8e0-80d0-4896-9f92-d01b2492d55c" />

<img width="269" height="226" alt="image" src="https://github.com/user-attachments/assets/f7f74ea4-0af5-4126-b2d7-9c0827ef4324" />
</div>


**For Connectors (Lines):**

Connectors are thin, so selecting them can be tricky! Two methods:

**Method 1: Hover and Click**
1. Move your cursor near where the line passes
2. When the **tooltip appears**, you're hovering over the line
3. Click to select it
4. **Indicator dots** appear at all bend points

**Method 2: Click the Pivot**
1. Click the area where the pivot (M-coordinate) is located
2. Lines have their bounding rectangle at the pivot
3. Indicator dots appear

<img width="163" height="248" alt="multi line point" src="https://github.com/user-attachments/assets/db2b6d1d-47bf-4e81-918b-eb4280e44d1a" />

Once selected, you can:
- Drag the pivot to move the entire line
- Click, hold and Drag any indicator dot (except pivot) to extend and change direction
- Double-click arrow endpoint to add bend points

### Moving Components

Moving components is straightforward:

1. Click a component to select it
2. Click and drag anywhere on the component
3. Move it to the new position
4. Release to drop it

![Moving Component Demo](./docs/videos/move-component.gif)

**Important: Components Move Independently**

When you move a component, **connected lines do NOT move with it**. Each element is independent.

**What happens?**
- If you drag a component away from a line, the connection **automatically breaks** when out of proximity
- Lines stay in place - they don't follow the component
- This is intentional design - gives you precise control

**Future Enhancement:** We're considering a "group selection" feature that lets you select and move multiple elements together. [Share your thoughts](#we-want-your-feedback)!

**Reconnecting:** To reconnect after moving, just drag the component or line back into proximity (10-15px) and they'll snap together again.

### Viewing Component Information

Want to see a component's properties while designing? Just hover over it!

**Tooltip Display:**

1. Move your cursor over any component (don't click)
2. A **tooltip popup** appears showing all properties:
   - Label
   - Description
   - All technical specs (gape, set, aperture, grade, quantity, etc.)
   - For concentrators: complete mass balance calculations!
3. Move your cursor away - tooltip disappears

<img width="234" height="171" alt="bonds-calc-component-2" src="https://github.com/user-attachments/assets/669552d1-1b3b-4792-8489-9866cb20cafe" />


**Tooltip While Selected:**

Even when a component is selected (showing the bounding box), you can still hover to see the tooltip:
- First click selects the component (tooltip disappears if it was showing)
- While selected, hover over it again to display the tooltip
- Tooltip even stays visible while dragging (if already open)!

**For Connectors:**

Hover over a connector to see:
- Label
- Description
- (No from/to information - not needed for users)

**Pro Tip:** Use tooltips to quickly verify properties without opening property dialogs or searching through lists!

### Working with Overlapping Elements

When multiple elements overlap, which one appears on top? ProFlo uses a **z-index system**:

**Default Behavior:**
- All elements start with the same z-index
- Elements are stacked in the order they were added (last added = on top)

**Active Element Priority:**
- When you click an element, it becomes **active**
- Active elements have a higher z-index (appear on top)
- This lasts until you "hover on"/click another element


---

## Saving Your Work

ProFlo offers flexible saving options - choose what works best for your workflow!

### Manual Save

With manual save, you control exactly when your work is saved.

**How to use manual save:**

1. Click the **"saved"** dropdown in the top navigation
2. Ensure **"Manual"** mode is selected
3. Make changes to your flowsheet
4. The button changes from **"saved"** to **"save"** (indicating unsaved changes)
5. Click **"Save Changes"** button whenever you want to save
6. Button changes to **"saving..."** then back to **"saved"**

<img width="141" height="147" alt="manual save" src="https://github.com/user-attachments/assets/817e473e-c765-45cb-a97c-6604c9562876" />


**When to use manual save:**
- You want full control over save points
- You're making experimental changes and want to decide what to keep
- You prefer explicit "checkpoint" saves before major changes

### Auto Save

Auto save periodically saves your work automatically - no need to remember!

**How to set up auto save:**

1. Click the **"saved"** dropdown
2. Select **"Auto"** mode
3. Enter the interval in the **"Interval: ___ secs"** field
   - Minimum: 10 seconds
   - No maximum - set what works for you (30, 60, 120 seconds, etc.)
4. Click **"Save Changes"** to activate

<img width="132" height="159" alt="auto save" src="https://github.com/user-attachments/assets/eeb922f0-fda1-48c0-8257-d4897b542068" />


**How auto save works:**
- ProFlo saves automatically every X seconds (your interval)
- **Only saves if changes were made** - won't waste saves if you're just viewing
- Button shows **"saving..."** during auto-save, then **"saved"**

**What counts as a change?**
- Moving or dragging components
- Creating connections
- Deleting elements
- Adding new components or shapes

**Manual save in auto mode:** Even with auto save enabled, you can click **"Save Changes"** anytime to save immediately. Great for important checkpoints!

**When to use auto save:**
- You want peace of mind with automatic backups
- You're working on complex designs and don't want to lose progress
- You forget to save manually (we all do it!)

### Understanding Save Status

The save button has three states:

**"saved"** (Green)
- No unsaved changes
- Your work is safely stored
- Everything up to date

**"save"** (Alert state)
- You have unsaved changes
- Click to save now
- Appears in both manual and auto mode when changes detected

**"saving..."** (Processing)
- Save in progress
- Please wait
- Appears briefly, then returns to "saved"

![Save Status States](./docs/images/save-status-states.png)

**Browser Protection:**

If you try to leave the page (close tab, navigate away, refresh) while you have unsaved changes, your browser will warn you:

**"You have unsaved changes. Are you sure you want to leave?"**

This works in both manual and auto save modes - if the status isn't currently "saved", you'll get a warning. This prevents accidental data loss!

**What's Saved:**

When you save a flowsheet, ProFlo stores:
- All flowsheet metadata (name, description)
- Complete canvas state (every component, shape, connector)
- All component properties
- Element positions and arrangements
- Component connections and relationships

**What's NOT Saved:**

- Project metadata (that's saved separately when you create/edit projects)
- Your canvas view/zoom level (resets on reload)

**Result:** When you refresh the page or come back later, your flowsheet appears exactly as it was when last saved!

---

## Utility Features

The Utility dropdown in the top navigation provides access to calculation tools and analysis features.

<img width="222" height="158" alt="utility" src="https://github.com/user-attachments/assets/fc0de2f9-c332-4181-ae73-fc0e275d4463" />

**Note:** Spreadsheet functionality for particle sizing still in development, [Let's hear your feedback](#we-want-your-feedback) if you'll like to use this feature often.

### Bond's Energy Calculation

One of ProFlo's most powerful features is **Bond's Work Index energy calculation** for comminution (size reduction) processes.

**What is Bond's Energy?**

Bond's Work Index is an industry-standard method for calculating the energy required to crush or grind ore from one size to another. It's essential for:
- Equipment selection and sizing
- Power requirement estimation
- Process design and optimization
- Operating cost estimation

**Bond's Formula:**
```
W = 10 × Wi × (1/√P₈₀ - 1/√F₈₀)
```

Where:
- **W** = Work energy (kWh per ton)
- **Wi** = Bond Work Index (material-specific, kJ/kg)
- **P₈₀** = Product size (80% passing, microns)
- **F₈₀** = Feed size (80% passing, microns)

Don't worry - you don't need to calculate this manually! ProFlo does it for you.

### Understanding the Calculation

**How ProFlo Calculates F₈₀ and P₈₀:**

Instead of requiring you to perform laboratory particle size analysis, ProFlo estimates these values from your component specifications:

**F₈₀ (Feed Size):**
- Uses **80% of maxOreSize** of the first crusher/grinder
- maxOreSize is automatically tracked through your flowsheet connections
- Represents the actual feed material size to that crushing stage

**P₈₀ (Product Size):**
- Uses **80% of Set** of the second crusher/grinder
- Set is the closed-side setting (product size)
- Represents the material size after crushing

**Why 80%?**

The "80% passing" is an industry standard in Bond's equation. ProFlo uses a factor of 0.8 as a practical approximation:
- Conservative estimate for design purposes
- Suitable for preliminary feasibility studies
- Provides reasonable energy requirements without lab analysis

**Important Context:**

⚠️ **Design-Level Estimates:** ProFlo provides approximate energy requirements for preliminary design. These calculations are based on equipment specifications, not actual particle size distribution (PSD) analysis.

✅ **Good for:** Feasibility studies, initial flowsheet design, equipment comparison

❌ **Not a substitute for:** Detailed engineering, final equipment selection, precise power calculations

**For detailed engineering:** Conduct actual particle size distribution analysis and use measured P₈₀/F₈₀ values with Bond's equation. ProFlo estimates should be verified with detailed studies before final design.

**Reality vs. Approximation:**

| Aspect | ProFlo Approach | Real-World Practice |
|--------|-----------------|---------------------|
| **F₈₀/P₈₀** | Estimated from gape/set | Laboratory sieve analysis |
| **Accuracy** | ±15-25% typical | High precision |
| **Time Required** | Instant | Days/weeks |
| **Use Case** | Preliminary design | Final engineering |
| **Cost** | Free | Lab analysis costs |

### How to Calculate Bond's Energy

Ready to calculate? Here's the step-by-step process:

**Step 1: Open Bond's Energy Calculator**

1. Click **"utility"** dropdown in the top navigation
2. Select **"Calculate Bonds Energy"**
3. A dialog appears with instructions

<img width="787" height="444" alt="bonds energy dialog box" src="https://github.com/user-attachments/assets/89e48d73-07ab-49bd-bc9d-cac9677fec39" />

**Step 2: Enter Work Index**

1. You'll see a field: **"Work Index in kJ/Kg"**
2. Enter the Bond Work Index for your material
3. Don't know the value? Click the **"here"** link to view a reference table of common materials

**Common Work Index Values:**
- Limestone: 11-13 kJ/kg
- Granite: 15-16 kJ/kg
- Iron ore: 13-15 kJ/kg
- Gold ore: 14-17 kJ/kg
- Copper ore: 12-15 kJ/kg

(Full table available via the link in the calculator)

**Step 3: Select Components**

Now you'll click on the crushers/grinders you want to calculate between:

**For Energy Between Two Stages:**
1. Click the **first crusher/grinder** (feed point)
2. Click the **second crusher/grinder** (product point)
3. ProFlo validates that a connection path exists between them
4. If valid, calculation runs!

![Selecting Two Components](./docs/videos/select-two-components.gif)

**For Energy of a Single Crusher:**
1. Click the **same crusher/grinder twice**
2. ProFlo calculates the energy for that single crushing stage
3. Uses Gape as F₈₀ and Set as P₈₀

**Step 4: View Results**

A results popup appears showing:

```
Bond's Energy summary between [Component 1] and [Component 2]

Df = XXXX.XX (Feed size, F₈₀ in mm)
Dp = XXX.XX (Product size, P₈₀ in mm)
Work Index = XXkJ/Kg

Energy used for comminution between the two points in the circuit is:
X.XXXkW h/short ton
```

<img width="545" height="220" alt="bonds-energy-result" src="https://github.com/user-attachments/assets/f955d343-466a-403f-b8b5-6697a8b4134d" />

**Understanding the Results:**

- **Df (Feed):** 80% of the first component's maxOreSize or gape
- **Dp (Product):** 80% of the second component's set
- **Energy:** Calculated using Bond's formula
- Result is in **kWh per short ton** of ore processed

**Example Calculation:**

You want to calculate energy between a gyratory crusher and a jaw crusher:

```
Gyratory Crusher:
- Gape: 1400mm
- Set: 700mm
- maxOreSize: 1120mm (after connections)

Jaw Crusher:
- Gape: 600mm  
- Set: 300mm

Work Index: 76 kJ/kg (entered by user)

Calculation:
Df = 0.8 × 1120mm = 896mm
Dp = 0.8 × 300mm = 240mm

Energy = 10 × 76 × (1/√240 - 1/√896)
       = 0.833 kWh/short ton
```

**Step 5: Close or Calculate Again**

- Click **"Close"** to exit the calculator
- Or click **"Discard"** to exit without calculating
- Calculator stays open - you can perform multiple calculations!

**Important Validation Rules:**

✅ **Both clicks must be on crushers or grinders** (not shapes, not other components)

✅ **A valid connection path must exist** between the two components (if calculating between two stages)

❌ **If no valid path exists**, you'll see an alert: "No valid connection between the 2 points"

❌ **If you click non-comminution components**, it fails silently (no error, no calculation)

**Pro Tips:**

- Calculate energy for each stage separately to identify high-energy operations
- Compare different crusher options by calculating energy for each scenario
- Use the single-crusher calculation (click twice) to verify individual stage energy
- Results are NOT included in PDF exports currently - screenshot or note them separately

---

## Exporting Your Work

When you're done designing, export your flowsheet as images and professional documentation!

### PNG Export

The PNG export gives you a visual image of your flowsheet - perfect for presentations, reports, or quick sharing. 

**How to export PNG:**

1. Click the **"Export"** button in the top navigation
2. PNG download starts **automatically**
3. File is saved as: **`[flowsheet-name].png`**

<img width="1434" height="79" alt="image" src="https://github.com/user-attachments/assets/81c2267b-e48b-4801-bc29-bab515d79331" />

**What's included:**
- Complete flowsheet visual
- All components with their images
- All connectors showing material flow
- Clean white background
- ProFlo branding

**PNG is automatically downloaded** - you don't need to do anything else! Check your browser's download folder.

**When to use PNG:**
- Adding flowsheet diagrams to presentations
- Including in reports or documents
- Quick visual reference
- Sharing designs via email or messaging
- Social media or portfolio (if applicable)

### PDF Report Export

After the PNG downloads, ProFlo asks if you want a comprehensive PDF report with complete technical documentation.

**The PDF Prompt:**

A dialog appears:
**"Do you want to download an additional report of your design"**

- Click **"No"** (red button) - Skip PDF, you're done
- Click **"Yes"** (green button) - Generate and download PDF report

<img width="388" height="256" alt="pdf-save-prompt" src="https://github.com/user-attachments/assets/1cb3895d-ab91-4706-b4b4-f7ea20be2c89" />


**PDF Generation:**

After clicking "Yes":
1. ProFlo generates your PDF report (may take a few seconds)
2. PDF downloads automatically
3. File is saved as: **`[flowsheet-name].pdf`**

### What's Included in Reports

The PDF report is a comprehensive technical document with everything about your flowsheet:

**Report Structure:**

**1. Title Page**
- "Report On [Flowsheet Name]"
- Flowsheet description

**2. Flowsheet Diagram**
- Full visual image (same as PNG)
- Shows complete design layout

**3. Detailed Documentation Sections**

The report organizes all your components and connections by category:

---

**Connectors Section**

Lists every connector with:
- Connector label
- Description of operation
- **Source:** Label and component type
- **Destination:** Label and component type

Example:
```
Conveyor A
Description: Material transport from crusher to screen
Source:
  Label: Primary Crusher
  Name: Crusher
Destination:
  Label: Vibrating Screen 1
  Name: Screener
```

---

**Crushing Components Section**

(Includes both Crushers and Grinders)

For each crusher/grinder:
- Component label
- Equipment type (Jaw Crusher, Cone Crusher, Ball Mill, etc.)
- Description of operation
- Crusher stage (primary/secondary/tertiary)
- **Gape:** "has a gape of size Xmm thus maximum Diameter of feed in which 80% passes is Y.YY"
- **Set:** "has a set of size Xmm thus maximum Diameter of product in which 80% passes is Y.YY"
- **Component image displayed**

Example:
```
Primary Jaw Crusher
Crusher Type: Jaw Crusher
Description: Primary crushing of run-of-mine ore
Used as a primary crusher in the design
Has a gape of 1400mm → maximum diameter of feed (80% passing) is 1120.00mm
Has a set of 700mm → maximum diameter of product (80% passing) is 560.00mm
```

---

**Screening Components Section**

For each screener:
- Component label
- Screen type
- Description of operation
- **Aperture:** "has an aperture of size Xmm"
- **Component image displayed**

---

**Auxiliary Components Section**

For each auxiliary:
- Component label
- Auxiliary component type (ORE, STOCKPILE, etc.)
- Auxiliary component name
- Description of operation
- **For ORE types:**
  - Maximum diameter of individual particle
  - Grade of the ore
  - Quantity of the ore in tons
- **Component image displayed**

---

**Concentrator Components Section**

For each concentrator:
- Component label
- Concentrator type
- Description of operation
- **Feed Properties:**
  - Quantity of ore going through the concentrator
  - Grade of ore going through
- **Recovery Criteria:**
  - Recovery (%) of valuable mineral
  - Recovery (%) of gangue
- **Ore Recovery Analysis:**
  - Valuable ore (%) present in feed
  - Gangue (%) present in feed
- **Concentrate (Product):**
  - Quantity of valuable ore (tons)
  - Quantity of gangue (tons)
- **Waste (Tailings):**
  - Quantity of gangue (tons)
  - Quantity of valuable ore (tons)
- **"Mass balance around the concentrator is maintained."**
- **Component image displayed**

Example:
```
Magnetic Separator
Concentrator Type: Magnetic separator
Description: Magnetic separation for iron ore recovery
Quantity: 5000 tons
Grade: 0.6
Recovery: 70% valuable, 30% gangue

Ore Recovery Analysis:
Valuable ore in feed: 60%
Gangue in feed: 40%

Concentrate:
Valuable ore: 2100.00 tons
Gangue: 1400.00 tons

Waste:
Gangue: 600.00 tons
Valuable ore: 900.00 tons

Mass balance maintained ✓
```

---

**Shape Components Section**

For standard shapes:
- Component label
- Shape type (Rectangle, Triangle, Polygon, etc.)
- Description of operation
- (No images - shapes are generic)

---

**What's NOT in the PDF:**

❌ Bond's energy calculations (only shown in software)  
❌ Real-time tooltip information  
❌ Component positions/coordinates  
❌ Canvas zoom/view settings

**Dynamic Sections:**

The PDF only includes sections for components actually used in your flowsheet. If you don't have any grinders, there's no Grinding Components section. This keeps reports concise and relevant!

**Professional Documentation:**

The PDF report is suitable for:
- Engineering documentation and reviews
- Project records and archival
- Regulatory compliance
- Team communication
- Client presentations
- Academic submissions

**File Quality:**

- Components appear with their actual images/icons
- Clean, professional formatting
- Easy-to-read layout
- Printable and shareable

---

## Best Practices

Here are some tips to get the most out of ProFlo:

**Documentation:**

✅ **Use clear, descriptive labels** - Future you (and your team) will thank you!

✅ **Write detailed descriptions** - Explain the purpose and specifications of each operation

✅ **Document design decisions** - Use text components to note why you chose specific equipment

✅ **Be consistent with naming** - Use a standard convention (e.g., "Primary Crusher 1", "Primary Crusher 2")

**Design Workflow:**

✅ **Start with a plan** - Sketch your flowsheet on paper first to organize your thoughts

✅ **Work left-to-right** - Follow material flow: ore feed → crushing → screening → concentration

✅ **Use projects to organize** - Group related flowsheets together for easier management

✅ **Save frequently** - Use auto-save or manual saves regularly to protect your work

✅ **Use flowsheet footprints** - Create variants of existing designs instead of starting from scratch

**Connection Strategy:**

✅ **Add components first, then connect** - It's easier to arrange components before drawing connectors

✅ **Use polylines for clarity** - Route connectors around components to avoid overlap

✅ **Check validation** - Watch for gray lines indicating invalid connections

✅ **Use nodes for complex flows** - Simplify multiple inputs/outputs with junction nodes

**Component Specifications:**

✅ **Double-check gape and set values** - These are critical for validation!

✅ **Verify ore properties** - Ensure max size, grade, and quantity are accurate

✅ **Use realistic values** - Base specifications on actual equipment or industry standards

✅ **Consider the 80/20 rule** - Remember that feed should be ~20% smaller than gape

**Multiple Equipment:**

✅ **Use text annotations** - When you need multiple units, represent one with specs and annotate quantity

✅ **Document parallel operations** - Use text like "4 units in parallel" for clarity

**Quality Control:**

✅ **Review tooltips** - Hover over components to verify properties before exporting

✅ **Check concentrator calculations** - Ensure mass balance makes sense

✅ **Export and review** - Look at your PNG export to catch visual issues

✅ **Generate PDF early** - Review the full documentation to ensure everything is captured correctly

---

## Current Limitations

ProFlo Version 1 is powerful, but there are some limitations we're working to improve. Here's what you should know:

### Screener Output Limitation

**Current Behavior:**
- Screeners only track **undersize output** (material that passes through)
- Oversize output is not currently tracked or validated

**Real-World Reality:**
- Screeners have two outputs: undersize AND oversize
- Both streams are important in actual operations

**Workaround:**
- Use a screener with aperture ≥ ore size to ensure material "passes through" for validation
- Note in the description which stream (undersize/oversize) you're tracking
- Use shapes/text to represent the other stream if needed

**Future Enhancement:**
We're working on implementing dual outputs for screeners. This will allow:
- Separate undersize and oversize connections
- Better validation of screening circuits
- More accurate flowsheet representation

### Primary Crusher Restriction

**Current Behavior:**
- Only ONE primary crusher allowed per flowsheet
- Additional crushers must be designated as secondary or tertiary

**Real-World Reality:**
- Large operations often have multiple primary crushers in parallel
- All primary crushers typically have identical specifications

**Workaround:**
- Create one primary crusher with correct specifications
- Use text component to annotate: "4 units in parallel"
- This documents quantity while maintaining specification standards

**Future Enhancement:**
We're considering allowing multiple primary crushers IF they have matching gape/set values. The system would validate that all "primary" crushers have identical specifications.

### Validation Scope Limitation

**Current Behavior:**
- Validation runs only between directly connected components (pair-wise)
- No full-chain validation from start to finish

**Real-World Reality:**
- Complete flowsheet validation requires checking the entire material flow path
- End-to-end validation catches issues that local validation might miss

**Why This Limitation Exists:**
- ProFlo doesn't track a definitive "starting point"
- Users can build flowsheets in any order, anywhere on the canvas
- Non-linear workflows and multiple parallel paths are common

**Current Approach:**
- Each connection validates independently
- Properties propagate through connections
- Users must verify overall flow makes sense

**Future Enhancement:**
We're exploring a "Simulation Studio" feature where you could:
- Specify start and end points of your process
- Run full-chain validation
- Get comprehensive feasibility analysis
- Identify bottlenecks and issues

### Multiple Input Handling

**Current Behavior:**
- When a component has multiple input lines with different properties
- System uses the **most recently connected** input for property values
- Default/manual values are retained as fallback

**Real-World Reality:**
- Multiple inputs often need to be averaged or combined
- Different properties from different streams require careful handling

**Best Practice:**
- Ensure multiple inputs have compatible properties (matching maxOreSize, etc.)
- Use nodes to combine streams before feeding into components
- Document any assumptions in component descriptions

**Future Enhancement:**
- Weighted averaging of multiple input properties
- User-configurable merge logic
- Better handling of stream combinations

### Bond's Energy Calculation Approximations

**Current Approach:**
- F₈₀ = 80% of maxOreSize (or gape)
- P₈₀ = 80% of Set
- Provides design-level estimates

**Real-World Reality:**
- True P₈₀/F₈₀ require laboratory particle size distribution analysis
- Actual values may vary ±15-25% from estimates

**Important Context:**
- ProFlo calculations are suitable for preliminary design
- NOT a substitute for detailed engineering
- Always verify with actual lab analysis before final design

**Future Enhancements:**
- Database of Work Index values for common materials
- Option to input custom F₈₀/P₈₀ values from lab analysis
- Equipment-specific refinements based on crusher type
- More accurate multipliers based on research data

### No Bond's Energy in PDF Export

**Current Behavior:**
- Bond's energy calculations only appear in software popup
- Not included in PDF report export

**Workaround:**
- Screenshot calculation results
- Manually note values in component descriptions
- Create separate documentation for energy calculations

**Future Enhancement:**
- Include Bond's energy results in PDF reports
- Option to run calculations on export
- Summary of all energy requirements by stage

### Property Locking

**Current Behavior:**
- All component properties are **permanently locked** after creation
- Cannot edit any field (including labels and descriptions)

**Design Rationale:**
- Ensures documentation integrity
- Once an operation is defined, documentation shouldn't change arbitrarily
- Encourages thoughtful component setup

**Workaround:**
- Delete and recreate component if changes needed
- Use flowsheet footprint to copy design before making changes

**Alternative Approach:**
Some users have suggested allowing label/description edits while locking technical properties. We're gathering feedback on this!

### Desktop Only - No Mobile Support

**Current Behavior:**
- ProFlo is designed for desktop browsers only
- Not optimized for mobile devices or tablets

**Why:**
- Complex drag-and-drop interactions require precise mouse control
- Canvas-based design works best on larger screens
- Technical documentation typically created on desktop

**Future Consideration:**
- Mobile viewer (read-only) for reviewing flowsheets
- Tablet support with optimized touch interactions
- For now, please use desktop/laptop for best experience


**Let Us know what else you'll like us to improve**
  

---

## We Want Your Feedback!

ProFlo is continuously improving, and **your input is invaluable**! We've shared several limitations and potential enhancements throughout this documentation. Now we want to hear from you:

### What We'd Love to Know

**About Current Limitations:**
- Which limitations impact you most?
- What workarounds are you using?
- How critical is each limitation to your work?

**About Proposed Enhancements:**
- Which features would you find most valuable?
- What's missing from ProFlo that you need?
- How would you prioritize improvements?

**About Your Experience:**
- What do you love about ProFlo?
- What's frustrating or confusing?
- What features do you use most?

**About Your Use Case:**
- How are you using ProFlo? (education, professional design, research, etc.)
- What industry or application?
- What would make ProFlo more valuable for you?

**Specific Questions We're Exploring:**

1. **Screener Outputs:** How important is dual output (oversize/undersize) tracking?

2. **Multiple Primary Crushers:** Should we allow multiple primaries with matching specs?

3. **Grade Input for Concentrators:** Keep manual input for accuracy, or add auto-calculation with fixed % loss?

4. **Bond's Energy Approximations:** Are current estimates useful? Would you use custom F₈₀/P₈₀ input if available?

5. **Full-Chain Validation:** Would a "Simulation Studio" with start/end points be valuable?

6. **Property Editing:** Should we allow editing labels/descriptions after creation?

7. **Component Library:** What equipment types are missing? What custom components do you use most?

8. **Export Features:** What else should be included in PDF reports?

### Share Your Feedback

**Feedback Form:** [INSERT FEEDBACK FORM LINK HERE]

We review all feedback and use it to prioritize development. Your input directly shapes ProFlo's future!

**Bug Reports:**
If you encounter bugs or technical issues, please report them with:
- What you were trying to do
- What happened vs. what you expected
- Screenshots if possible
- Browser and operating system

**Feature Requests:**
Have an idea for a new feature? Share:
- What you want to accomplish
- Why it's important to your work
- How you envision it working

Thank you for helping us make ProFlo better! 🙏

---

## Frequently Asked Questions

### General Questions

**Q: Is ProFlo free to use?**
A: Yes for now, it's free.

**Q: Do I need to download or install anything?**
A: No! ProFlo is a web-based application. Just create an account and start designing in your browser.

**Q: Can I work offline?**
A: Currently, ProFlo requires an internet connection. All your work is saved in the cloud for access from any device.

**Q: Is my data secure?**
A: Yes! Your flowsheets and projects are stored securely and are only accessible to you.

**Q: Can I collaborate with team members?**
A: Currently, collaboration features are limited to sharing URLs. Each user works on their own flowsheets. Multi-user collaboration is being considered for future versions.

### Account & Login

**Q: I forgot my password. What do I do?**
A: Click "Forgot password" on the login page, enter your email, and you'll receive a reset link. This is why we recommend using a valid email!

**Q: Can I change my email address?**
A: No, but definitely in future version.

**Q: What if I signed up with Google and want to use email/password instead?**
A: Any account created from google auth would always use google for authentication. If you need to change to email/password you might need to create another account to that effect.

### Projects & Flowsheets

**Q: Can I move a flowsheet from one project to another?**
A: Currently, flowsheets are permanently associated with their project. Workaround: Use flowsheet footprint to copy it to a new flowsheet in the target project, then delete the original.

**Q: How many projects and flowsheets can I create?**
A: For now, no restriction (Use sparingly)

**Q: Can I rename a project or flowsheet after creating it?**
A: Yes, just use the edit feature from the 3 dots.

**Q: What happens if I delete a project? Are the flowsheets deleted too?**
A: Yes! Deleting a project permanently deletes all flowsheets within it. Use with caution!

### Design & Components

**Q: Can I undo/redo changes on the canvas?**
A: Currently, there's no undo/redo feature. We recommend saving frequently and using flowsheet footprints to create "checkpoints" before major changes. Future versions will include this feature.

**Q: How do I rotate or flip components?**
A: Currently, components cannot be rotated or flipped. They appear in their standard orientation. Let us know if you really want this feature.

**Q: Can I change the grid size or turn it off?**
A: The grid is currently fixed. It helps with alignment but doesn't restrict placement.

**Q: Why can't I edit component properties after creating them?**
A: This is an intentional design decision for documentation integrity. Once operations are defined and connected, their specifications shouldn't change. Delete and recreate if needed. Reviews are ongoing and we might allow editing them in future versions.

**Q: Can I copy/paste components?**
A: Not currently. You will need to manually drag it again to the canvas from the sidebar, bear with us for now (we are working on this feature).

**Q: How do I delete a component or connector?**
A: Select the element (click it), then press Delete key or use the delete option from a context menu (if available).

### Connections & Validation

**Q: Why is my connector gray?**
A: Gray indicates invalid or disconnected. Check:
- Is it connected to components at both ends?
- Does the ore size fit the crusher gape (80/20 rule)? (if using communition)
- Are the components compatible?
- You can raise a complaints on the feedback tab on the flowsheet dashboard.
<img width="1236" height="253" alt="image" src="https://github.com/user-attachments/assets/03d6ff3b-2f3d-4245-8c36-b3328356cabf" />


**Q: Can I connect more than two components with one line?**
A: No - each connector links exactly two points (one input, one output). Use nodes to create junction points for multiple connections.

**Q: My connection is valid in reality, but ProFlo says it's invalid. Why?**
A: ProFlo has some limitations (like screener undersize-only). If you believe there's an error, please [submit feedback](#we-want-your-feedback) with details!

**Q: Do I need to connect components in a specific order?**
A: No! You can add components and connectors in any order. Validation happens based on properties, not creation sequence.

Your questions aren't here? [Ask here](#we-want-your-feedback)

### Calculations

**Q: How accurate are Bond's energy calculations?**
A: They're estimates suitable for preliminary design (typically ±15-25% accuracy). For detailed engineering, always verify with laboratory analysis and actual equipment specifications.

**Q: Can I see historical calculations?**
A: Currently, calculations are only shown in the popup and not saved. Screenshot or note results separately.

**Q: Why doesn't Bond's energy appear in my PDF export?**
A: This is a current limitation. We're considering adding it in future versions!

**Q: Can I customize the Work Index values?**
A: Yes! Enter any Work Index value manually. A reference table is provided for common materials.

### Export & Sharing

**Q: What resolution is the PNG export?**
A: [INSERT RESOLUTION INFORMATION HERE]

**Q: Can I export to other formats (SVG, DWG, etc.)?**
A: Currently, only PNG and PDF are supported. Other formats may be added based on user demand.

**Q: Can I edit the PDF report after exporting?**
A: The PDF is a static document. To make changes, edit your flowsheet in ProFlo and re-export.

**Q: How do I share my flowsheet with others?**
A: Use the Share option to copy a URL, or send them the exported PNG/PDF files.

**Q: Can others edit my shared flowsheets?**
A: [INSERT SHARING PERMISSIONS INFORMATION HERE]

### Technical Issues

**Q: ProFlo is running slowly. What should I do?**
A: Try:
- Closing other browser tabs/applications
- Clearing browser cache
- Using a different browser (Chrome recommended)
- Checking your internet connection
- Refreshing the page (make sure work is saved first!)

**Q: My component won't connect. What's wrong?**
A: Check:
- Are you dragging close enough (within 10-15px)?
- Is the line already connected to something else?
- Are you trying to connect line-to-line (not allowed)?
- Is it a text component (cannot accept connections)?

**Q: I uploaded a custom component but can't see it.**
A: Check:
- Was the upload successful? (Look for confirmation)
- Is it in the Personalized Objects section?
- Try refreshing the page
- Check file size (under 2MB recommended)

**Q: The page won't load or keeps crashing.**
A: Try:
- Refreshing the page
- Clearing browser cache and cookies
- Using a different browser
- Checking if ProFlo is experiencing downtime [INSERT STATUS PAGE LINK]

**Q: I lost my work! What happened?**
A: Check:
- Browser console for errors
- Your internet connection
- If you saved before the issue occurred
- Recent/auto-save status

Always use auto-save or save frequently to protect your work!

---

## Support

Need help? Here's how to get support:

### Documentation
- **This README:** Comprehensive guide to all features
- **Video Tutorials:** [INSERT VIDEO TUTORIAL LINKS]
- **Quick Start Guide:** [INSERT QUICK START LINK]

### Help Resources
- **Knowledge Base:** [INSERT KNOWLEDGE BASE LINK]
- **Community Forum:** [INSERT FORUM LINK]
- **FAQ:** See section above

### Contact Support
- **Email:** [INSERT SUPPORT EMAIL]
- **Support Portal:** [INSERT SUPPORT PORTAL LINK]
- **Response Time:** [INSERT RESPONSE TIME INFO]

### Report Issues
- **Bug Reports:** [INSERT BUG REPORT FORM]
- **Feature Requests:** [INSERT FEATURE REQUEST FORM]
- **General Feedback:** [INSERT FEEDBACK FORM]

### Stay Updated
- **Release Notes:** [INSERT RELEASE NOTES LINK]
- **Product Updates:** [INSERT NEWSLETTER/BLOG LINK]
- **Social Media:** [INSERT SOCIAL MEDIA LINKS]

### Developer Resources
- **API Documentation:** [INSERT IF AVAILABLE]
- **GitHub Repository:** [INSERT IF AVAILABLE]
- **Contributing Guidelines:** [INSERT IF AVAILABLE]

---

## Acknowledgments

ProFlo was built with mineral processing professionals, students, and researchers in mind. We're grateful to:

- The mineral processing community for valuable feedback and testing
- Early adopters who helped shape ProFlo's features
- Everyone who shares feedback to make ProFlo better

**Built with:** [INSERT TECH STACK IF DESIRED]

---

## License

[INSERT LICENSE INFORMATION]

---

## Version History

**Version 1.0** (Current)
- Initial release
- Core flowsheet design features
- Component library (crushers, grinders, screeners, auxiliaries, concentrators)
- Connection validation
- Bond's energy calculation
- PNG and PDF export
- Manual and auto-save

**### Other "not available yet" features coming in v2 or future versions (Plans for Future Versions)**
- Additional component types
- Equipment database
- And more based on your feedback!
- Currently in version 1, you can't zoom in and out your canvas that's coming to.
- Object duplication (using ctrl+d)
- Undo changes (using ctrl+z)
- Grouping objects, so you can move them easily, duplicate them also using ctrl+d
- drag the canvas sheet to allow you bring a specific part of your design into view.
- Rich text for the text component
- Shapes would have editable text component embedded with them.
- Save history (allow for rolling back to previously saved state.)
- Components limitations improvement
- Connectors limitations (connectors will get smarter)
- Particle size analysis and Full-chain validation / Simulation Studio
- Enhanced collaboration features (including realtime) i.e more than one person working on a project.
- More emphasis on account management


---

## Quick Reference Card

### Keyboard Shortcuts
[INSERT KEYBOARD SHORTCUTS IF AVAILABLE]

### Common Actions
| Action | How To |
|--------|--------|
| Add component | Drag from sidebar to canvas |
| Connect components | Drag component or line within 10-15px |
| Select element | Click it |
| Move component | Click and drag |
| Add bend point | Double-click arrow endpoint |
| Delete element | Select and press Delete |
| Save | Click "Save Changes" or use auto-save |
| View properties | Hover over component |
| Export | Click "Export" button |

### Component Quick Reference
| Component | Key Properties |
|-----------|----------------|
| Crusher | Gape, Set, Type (Primary/Secondary/Tertiary) |
| Grinder | Gape, Set |
| Screener | Aperture |
| Ore (Auxiliary) | Max Size, Grade, Quantity |
| Concentrator | Quantity, Grade, Recovery % |

### Validation Rules
- Feed size ≤ 0.8 × Gape (80/20 rule)
- Feed size ≤ Screener aperture (for undersize)
- Valid connection path required for Bond's energy
- Gray line = invalid, Dark line = valid

---

**Thank you for using ProFlo!** 

We're excited to see the amazing flowsheets you'll create. Happy designing! 🎉

**Questions? Feedback? Ideas?**  
We'd love to hear from you → [INSERT CONTACT LINK]

---

*This documentation is for ProFlo Version 1.0. Last updated: [INSERT DATE]*

*ProFlo - Visualize, Design, and Document Your Mineral Processing Operations*
