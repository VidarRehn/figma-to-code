
export const initOptions = {
    accessToken: {
        message: 'What is your Figma Access Token?',
        name: 'accessToken',
        demandOption: true,
        describe: 'Your Figma Access Token',
        type: 'string',
    },
    documentId: {
        message: 'What is your Figma Document ID?',
        name: 'documentId',
        demandOption: true,
        describe: 'Your Figma Document ID',
        type: 'string',
        },
    projectType: {
        message: 'Is this a React or Next project?',
        type: 'list',
        name: 'projectType',
        demandOption: true,
        describe: 'The type of project being built',
        choices: ['React', 'Next']
        },
    typeScript: {
        message: 'Is your project using Typescript?',
        type: 'confirm',
        name: 'typescript',
        demandOption: true,
        describe: 'Should we generate jsx or tsx files',
    }
    // What kind of styling??
    // jsx or tsx?
    };

    export const listOptions = (array) => {
        return {
            message: 'Select the component you want to use',
            type: 'list',
            name: 'chosenComponent',
            demandOption: true,
            describe: 'List of available components',
            choices: array.map(comp => comp.name)
        }
    }

    export const checkForChildren = {
        message: 'This component has children. Do you want to:',
        type: 'list',
        name: 'childrenOrParent',
        demandOption: true,
        describe: 'Generate component based on parent or children',
        choices: ['Use the parent', 'See children components']
    }