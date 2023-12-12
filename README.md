# CERPENT
A VS Code plugin to allow CERPENT interventions (e.g. AIF) to be
run from within the IDE.

## Setup

Make sure you have Node.js installed and are editing this repository with VSCode.

1. Run `npm install`
2. Run the program (F5)
3. Install the recommended plugins for extension development

## Running SimpleAIF

1. Run the plugin
2. Create and edit a python file
3. When it asks you for your username, use 'abcd', since that should be in the experimental condition.
4. At the top of the file, put
```
# Problem: 103
```
Where 103 is the ID of the problem you'd like to test.
5. As you edit your code, you should receive AIF feedback.
6. Save or run your code. You should receive autograder feedback. Make sure you have the [autograder server](https://github.ncsu.edu/HINTSLab/AutograderServer) running on localhost.