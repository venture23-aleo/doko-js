export const ERROR_PREFIX = 'DOKOJS';

export interface ErrorDescriptor {
  number: number;
  message: string;
  title: string;
  description: string;
  shouldBeReported: boolean;
}

export function getErrorCode(error: ErrorDescriptor): string {
  return `${ERROR_PREFIX}${error.number}`;
}

export const ERROR_RANGES: {
  [category in keyof typeof ERRORS]: {
    min: number;
    max: number;
    title: string;
  };
} = {
  GENERAL: { min: 1, max: 99, title: 'General errors' },
  NETWORK: { min: 100, max: 199, title: 'Network related errors' },
  ARTIFACTS: { min: 200, max: 299, title: 'Artifacts related errors' },
  INTERNAL: { min: 300, max: 399, title: 'Internal DokoJS errors' },
  VARS: { min: 400, max: 499, title: 'Configuration variables errors' }
};

export const ERRORS = {
  GENERAL: {
    NOT_INSIDE_PROJECT: {
      number: 1,
      message: 'You are not inside a DokoJS project.',
      title: 'You are not inside a DokoJS project',
      description: 'You are trying to run command outside of a DokoJS project.',
      shouldBeReported: false
    },
    INVALID_NODE_VERSION: {
      number: 2,
      message:
        "DokoJS doesn't support your Node.js version. It should be %requirement%.",
      title: 'Unsupported Node.js',
      description: `DokoJS doesn't support your Node.js version.

Please upgrade your version of Node.js and try again.`,
      shouldBeReported: false
    },
    UNSUPPORTED_OPERATION: {
      number: 3,
      message: '%operation% is not supported in DokoJS.',
      title: 'Unsupported operation',
      description: `You are trying to perform an unsupported operation.
Please [report it](https://github.com/venture23-aleo/doko-js/issues/new) to help us improve DokoJS.`,
      shouldBeReported: true
    },
    INVALID_CONFIG: {
      number: 4,
      message: "There's one or more errors in your config file",
      title: 'Invalid DokoJS config',
      description: 'You have one or more errors in your config file.',
      shouldBeReported: false
    },
    DOKOJS_PROJECT_ALREADY_CREATED: {
      number: 5,
      message:
        'You are trying to initialize a project inside an existing DokoJS project',
      title: 'DokoJS project already created',
      description:
        'Cannot create a new DokoJS project, the current folder is already associated with a project.',
      shouldBeReported: false
    },
    NOT_IN_INTERACTIVE_SHELL: {
      number: 6,
      message:
        'You are trying to initialize a project but you are not in an interactive shell.',
      title: 'Not inside an interactive shell',
      description: `You are trying to initialize a project but you are not in an interactive shell.

Please re-run the command inside an interactive shell.`,
      shouldBeReported: false
    }
  },
  NETWORK: {
    CONFIG_NOT_FOUND: {
      number: 100,
      message: "Network %network% doesn't exist",
      title: "Selected network doesn't exist",
      description: 'You are trying to run DokoJS with a nonexistent network.',
      shouldBeReported: false
    },
    NODE_IS_NOT_RUNNING: {
      number: 101,
      message: `Cannot connect to the network %network%.
Please make sure your node is running, and check your internet connection and networks config`,
      title: 'Cannot connect to the network',
      description: `Cannot connect to the network.

Please make sure your node is running, and check your internet connection and networks config.`,
      shouldBeReported: false
    },
    NETWORK_TIMEOUT: {
      number: 102,
      message: `Network connection timed out.
Please check your internet connection and networks config`,
      title: 'Network timeout',
      description: `Requests timed out.

Please make sure your node is running, and check your internet connection and networks config.`,
      shouldBeReported: false
    },
    EMPTY_URL: {
      number: 103,
      message:
        'Empty string %value% for network URL - Expected a non-empty string.',
      title:
        'Empty string %value% for network URL - Expected a non-empty string.',
      description: `You are trying to connect to a network with an empty network URL.

Please check that you are sending a non-empty string for network URL parameter.`,
      shouldBeReported: false
    },
    INVALID_TRANSACTION_OBJECT: {
      number: 104,
      message: 'Invalid Transaction object',
      title: "Invalid transaction object for '%transitionName%'",
      description:
        "Receeived invalid transaction object for '%transitionName%'",
      shouldBeReported: false
    },
    DEPLOYMENT_CHECK_FAIL: {
      number: 105,
      message: 'Deployment check failed',
      title: 'Failed to check program deployment',
      description: 'Failed to check program deployment.',
      shouldBeReported: false
    },
    CONFLICTING_DEPLOYMENT: {
      number: 106,
      message: 'Program already deployed',
      title: 'Program %programName% is already deployed ',
      description: 'Existing deployment found for %programName%',
      shouldBeReported: false
    }
  },
  ARTIFACTS: {
    NOT_FOUND: {
      number: 200,
      message: 'Artifact for contract "%contractName%" not found.',
      title: 'Artifact not found',
      description: `Tried to import a nonexistent artifact.

Please double check that your contracts have been compiled and double check your artifact's name.`,
      shouldBeReported: false
    },
    MULTIPLE_FOUND: {
      number: 201,
      message:
        'There are multiple artifacts for contract "%contractName%", please use a fully qualified name.',
      title: 'Multiple artifacts found',
      description: `There are multiple artifacts that match the given contract name, and DokoJS doesn't know which one to use.

Please use the fully qualified name of the contract to disambiguate it.`,
      shouldBeReported: false
    },
    UNDECLARED_TYPE: {
      number: 202,
      message: 'Undeclared type',
      title: "Undeclared type '%value%' encountered",
      description:
        "Undeclared type '%value%' encountered when generating types.",
      shouldBeReported: false
    },
    INVALID_ALIAS_COUNT: {
      number: 203,
      message: 'Invalid aliases count',
      title: 'Invalid alias count for imports',
      description:
        'Invalid alias count generating imports. Expected: %expected% , Received: %received%',
      shouldBeReported: false
    }
  },
  INTERNAL: {
    WRONG_ARTIFACT_PATH: {
      number: 300,
      message:
        "The inferred artifact path for contract %contractName% is %artifactPath%, but this file doesn't exist",
      title: "Inferred artifact path doesn't exist",
      description: `The inferred artifact path doesn't exist.

Please [report it](https://github.com/venture23-aleo/doko-js/issues/new) to help us improve DokoJS.`,
      shouldBeReported: true
    },
    TEMPLATE_INVALID_VARIABLE_NAME: {
      number: 301,
      message:
        'Variable names can only include ascii letters and numbers, and start with a letter, but got %variable%',
      title: 'Invalid error message template',
      description: `An error message template contains an invalid variable name. This is a bug.

Please [report it](https://github.com/venture23-aleo/doko-js/issues) to help us improve DokoJS.`,
      shouldBeReported: true
    },
    TEMPLATE_VALUE_CONTAINS_VARIABLE_TAG: {
      number: 302,
      message:
        "Template values can't include variable tags, but %variable%'s value includes one",
      title: 'Invalid error message replacement',
      description: `Tried to replace an error message variable with a value that contains another variable name. This is a bug.

Please [report it](https://github.com/venture23-aleo/doko-js/issues) to help us improve DokoJS.`,
      shouldBeReported: true
    },
    TEMPLATE_VARIABLE_TAG_MISSING: {
      number: 303,
      message: "Variable %variable%'s tag not present in the template",
      title: 'Missing replacement value from error message template',
      description: `An error message template is missing a replacement value. This is a bug.

Please [report it](https://github.com/venture23-aleo/doko-js/issues) to help us improve DokoJS.`,
      shouldBeReported: true
    },
    TYPE_PARSING_FAILED: {
      number: 304,
      title: 'Parsing failed',
      message: "'%type%' parsing failed",
      description: "Failed to parse '%type%' type",
      shouldBeReported: false
    },
    MAPPING_PARSING_FAILED: {
      number: 305,
      title: 'Parsing failed',
      message: "'%mappingName%' parsing failed",
      description: "Failed to parse '%mappingName%' mapping",
      shouldBeReported: false
    },
    EXCEEDED_INT_VALUE: {
      number: 306,
      title: 'Exceeded max uint value',
      message: 'Exceeded max %type% value',
      description: 'Exceeded max %type% value: %value%',
      shouldBeReported: false
    },
    DECRYPTION_FAILED: {
      number: 307,
      title: 'Output Decryption Failed',
      message: 'Failed to decrypt output value in transaction',
      description: 'Failed to decrypt %value%',
      shouldBeReported: false
    }
  },
  VARS: {
    ONLY_MANAGED_IN_CLI: {
      number: 400,
      title: 'Configuration variables can only be managed from the CLI',
      message:
        'Configuration variables can only be managed from the CLI. They cannot be modified programmatically.',
      description:
        'Configuration variables can only be managed from the CLI. They cannot be modified programmatically.',
      shouldBeReported: false
    },
    EXECUTION_MODE_NOT_DEFINED: {
      number: 401,
      title: 'Execution mode is not defined',
      message: 'Execution mode not defined in contract config',
      description: 'Execution mode not defined in contract config',
      shouldBeReported: false
    },
    EXECUTION_MODE_UNSUPPORTED: {
      number: 402,
      title: 'Unsupported execution mode',
      message: "Execution mode '%value%' is not supported",
      description:
        "Execution mode is not supported. Received '%value%' Supported values for execution modes are enums in ExecutionMode",
      shouldBeReported: false
    },
    // Here
    VALUE_NOT_FOUND_FOR_VAR: {
      number: 403,
      title: 'Configuration variable is not set',
      message: "Cannot find a value for the configuration variable '%value%'.",
      description:
        'Cannot find a value for a mandatory configuration variable.',
      shouldBeReported: false
    },
    INVALID_CONFIG_VAR_NAME: {
      number: 402,
      title: 'Invalid name for a configuration variable',
      message:
        "Invalid name for a configuration variable: '%value%'. Configuration variables can only have alphanumeric characters and underscores, and they cannot start with a number.",
      description: `Invalid name for a configuration variable.

Configuration variables can only have alphanumeric characters and underscores, and they cannot start with a number.`,
      shouldBeReported: false
    },
    INVALID_EMPTY_VALUE: {
      number: 403,
      title: 'Invalid empty value for configuration variable',
      message: 'A configuration variable cannot have an empty value.',
      description: 'A configuration variable cannot have an empty value.',
      shouldBeReported: false
    }
  }
};
