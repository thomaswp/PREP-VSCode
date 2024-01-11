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
2. Create and edit a python file. Make sure its name matches a problem ID, e.g. `homework2.py` or `inlab3.py`.
3. When it asks you for your username, use 'abcd', since that should be in the experimental condition.
4. As you edit your code, you should receive AIF feedback.
  * If developing, you may need to run the [AIF server](https://github.ncsu.edu/HINTSLab/SimpleAIF).
5. Save and run your code. You should receive autograder feedback. 
  * If developing, you may need to run the [autograder server](https://github.ncsu.edu/HINTSLab/AutograderServer) running on localhost.