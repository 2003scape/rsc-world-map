module.exports = {
    'env': {
        'node': false,
        'browser': true,
        'commonjs': true,
        'es6': true
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
        'ecmaVersion': 2018
    },
    'rules': {
        'indent': [
            'error',
            4,
            {
                'SwitchCase': 1
            }
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'semi': [
            'error',
            'always'
        ],
        'no-constant-condition': [
            'error',
            {
                'checkLoops': false
            }
        ],
        'require-atomic-updates': 0,
        'no-prototype-builtins': 0
    }
};
