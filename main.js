var mysql = require('mysql2')
require('dotenv').config()
let connection = mysql.createPool({
    host: process.env.MYSQL_DB_HOST || 'localhost',
    user: process.env.MYSQL_DB_USER || 'root',
    password: process.env.MYSQL_DB_PASSWORD,
    database: process.env.MYSQL_DB_DBNAME
})
let conPromise = connection.promise()

class utils {
    constructor() {
        this.operation = ''
        this.field = '*'
        this.conditionList = []
        this.conditionStat = ''
        this.dataList = []
    }

    columns(listOfCol, brackets, update) {
        if (typeof(listOfCol) != 'object') {
            throw new Error('Unexpected argument ' + typeof(listOfCol) + "\nArgument must be a list")
        }
        var col
        let statement = ''
        for (col of listOfCol) {
            if (update) {
                statement += " " + col + " = ?,"

            } else {
                statement += " " + col + ","
            }
        }
        statement = statement.substr(0, statement.length - 1)

        if (brackets) {
            let withBracket = "("
            withBracket += statement
            withBracket += ")"
            this.field = withBracket
        } else {
            this.field = statement
        }
    }

    conditions(conds) {
        this.conditionList = []
        if (conds) {
            if (typeof conds != 'object') {
                this.conditionStat = `WHERE ${this.primaryKey} = ?`
                this.conditionList.push(conds)
            } else if (typeof conds == 'object') {
                this.conditionStat = 'WHERE '
                let x
                for (x in conds) {
                    var subConditionStat = `${x} = ? AND `
                    this.conditionList.push(conds[x])
                    this.conditionStat += subConditionStat
                }
                this.conditionStat = this.conditionStat.substr(0, this.conditionStat.length - 4)
            }
        } else {
            this.conditionStat = ''
        }
    }

    insertPHolders() {
        var x = 0
        var y = '('
        while (x < this.dataList.length) {
            y += ' ?,'
            x += 1
        }
        y = y.replace(/\,$/, '')
        y += ')'
        return y
    }
}

class table extends utils {
    constructor(name, primaryKey) {
        super()
        this.name = name
        this.query = ""
        this.limit = ''
	this.primaryKey = primaryKey
    }

    async execute() {
        switch (this.operation) {
            case 'SELECT':
                if (this.conditionList.length == 0) {
                    var [resul, fi] = await conPromise.execute(this.query)
                } else {
                    var [resul, fi] = await conPromise.execute(this.query, this.conditionList)
                }
                break;

            case 'INSERT INTO':
                var [reso, fi] = await conPromise.execute(this.query, this.dataList)
                var resul = await this.gett(reso.insertId, true)
                break;

            case 'UPDATE':
                var combinedList = this.dataList.concat(this.conditionList)
                var [resul, fi] = await conPromise.execute(this.query, combinedList)
                break;

            case 'DELETE':
                var [resul, fi] = await conPromise.execute(this.query, this.conditionList)
                break;
        }
        return resul
    }

    qr() {
        switch (this.operation) {
            case 'SELECT':
                this.query = `${this.operation} ${this.field} FROM ${this.name} ${this.conditionStat} ${this.limit}`
                break;
            case 'INSERT INTO':
                this.query = `${this.operation} ${this.name} ${this.field} VALUES ${this.insertPHolders()}`
                break;
            case 'UPDATE':
                this.query = `${this.operation} ${this.name} SET ${this.field} ${this.conditionStat}`
                break;
            case 'DELETE':
                this.query = `${this.operation} FROM ${this.name} ${this.conditionStat}`
                break;
        }
        return this.query
    }

    gett(condition, ex) {
        this.operation = 'SELECT'
        this.field = '*'
        this.limit = 'LIMIT 1'
        this.conditions(condition)
        this.qr()
        if (ex) {
            return this.execute()
        }
        return this
    }

    insert(data, ex) {
        if (!data) {
            throw new Error(`Argument cannot be ${typeof(data)} \n`)
        }
        this.field = ''
        this.operation = 'INSERT INTO'
        this.dataList = data
        this.qr()
        if (ex) {
            return this.execute()
        }
        return this
    }

    update(condition, values) {
        if (!condition) {
            throw new Error(`condition cannot be ${typeof(data)}\nIt must be a list`)
            if (!values) {
                throw new Error(`values cannot be ${typeof(values)}\nIt must be a list`)
            }
        }
        this.conditionList = []
        this.dataList = []
        this.field = ''
        this.operation = 'UPDATE'
        this.dataList = values
        this.conditions(condition)
        this.qr()
        return this

    }

    remove(condition, ex) {
        this.operation = 'DELETE'
        this.conditions(condition)
        this.qr()
        if (ex) {
            return this.execute()
        }
    }

    filter(condition, ex) {
        this.gett(condition)
        this.limit = ''
        this.qr()
        if (ex) {
            return this.execute()

        }
        return this
    }

    fi(fis, ex) {
        if (this.operation == 'INSERT INTO') {
            this.columns(fis, true)
        } else if (this.operation == 'UPDATE') {
            if (fis.length != this.dataList.length) {
                throw new Error(`Unequal columns and values\ncolumns = ${fis.length}\nvalues = ${this.dataList.length}`)
            }
            this.columns(fis, null, true)
        } else {
            this.columns(fis)
        }
        this.qr()
        if (ex) {
            return this.execute()
        }
        return this
    }
}

module.exports = table
