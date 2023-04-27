
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
    };

    export const listOptions = (array) => {
        return {
            message: 'Select the component you want to use',
            type: 'list',
            name: 'chosenComponent',
            demandOption: true,
            describe: 'List of available components',
            choices: array.map(comp => `${comp.name} (${comp.id})`)
        }
    }

    export const usedComponentsList = (array) => {
        array.push('All')
        return {
            message: 'Select the component you want refresh',
            type: 'list',
            name: 'chosenComponent',
            demandOption: true,
            describe: 'List of available components',
            choices: array.map(comp => {
                if (comp.id){
                    return `${comp.name} (${comp.id})`
                } else {
                    return comp
                }
            })
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

    export const confirmRegeneration = {
        message: 'Please be aware that this will overwrite any changes you may have done locally. Are you sure you want to continue?',
        type: 'confirm',
        name: 'overwrite',
        demandOption: true,
        describe: 'Confirm whether to overwrite existing files',
    }