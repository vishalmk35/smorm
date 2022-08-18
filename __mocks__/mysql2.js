const mysql2 = jest.createMockFromModule('mysql2')
//var mysql2 = {}

function promise() {
    return {
        execute: (ar, ar2) => {
            return new Promise((resolve, reject) => {
                resolve([
                    ['result', ar, ar2], 'fi'
                ])
            })
        }
    }
}


/*function promise() {
    return {
        execute: jest.fn().mockResolvedValue(['result', 'field'])
    }
}*/

function createPool() {
    return {
        promise: promise
    }
}

mysql2.createPool = createPool
mysql2.promise = promise

module.exports = mysql2
