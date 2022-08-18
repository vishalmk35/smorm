let cls = require('../main.js')
let Product = new cls('Product')
let mysql2 = require('mysql2')

jest.mock('mysql2')

test('Name of the table', () => {
    expect(Product.name).toEqual('Product')
})

test('Columns function', () => {
    Product.columns(["id", "name"])
    expect(Product.field).toBe(' id, name')
})


test('Columns function with brackets', () => {
    Product.columns(["id", "name"], true)
    expect(Product.field).toBe('( id, name)')
})

test('Columns function with update', () => {
    Product.columns(["id", "name"], null, true)
    expect(Product.field).toBe(' id = ?, name = ?')
})

test('Columns function with string as an arg', () => {
    expect(() => {
        Product.columns("id")
    }).toThrow()
})

test('Conditions function with object', () => {
    Product.conditions({
        'name': 'John',
        'lastName': 'Doe'
    })
    expect(Product.conditionStat).toBe('WHERE name = ? AND lastName = ? ')
    expect(Product.conditionList).toEqual(['John',
        'Doe'
    ])
})

test('Conditions function with id', () => {
    Product.conditions(3)
    expect(Product.conditionStat).toBe('WHERE id = ?')
    expect(Product.conditionList).toEqual([3])
})

test('Conditions function with no arguments', () => {
    Product.conditions()
    expect(Product.conditionStat).toBe('')
    expect(Product.conditionList).toEqual([])
})

test('InsertPHolders function with datalist length = 3', () => {
    Product.dataList = [1, 2, 3]
    expect(Product.insertPHolders()).toBe('( ?, ?, ?)')
})


test('InsertPHolders function with datalist length = 1', () => {
    Product.dataList = [1]
    expect(Product.insertPHolders()).toBe('( ?)')
})


test('Gett function with id', async () => {
    var se = await Product.gett(2, true)
    expect(se[0]).toBe('result')
    expect(se[1]).toBe('SELECT * FROM Product WHERE id = ? LIMIT 1')
    expect(se[2]).toEqual([2])
})


test('Gett function with no condition', async () => {
    var se = await Product.gett(null, true)
    expect(se[0]).toBe('result')
    expect(se[1]).toBe('SELECT * FROM Product  LIMIT 1')
    expect(se[2]).not.toBeDefined()
})

test('Gett function with id and name', async () => {
    var se = await Product.gett({
        name: 'water',
        id: 2
    }, true)
    expect(se[0]).toBe('result')
    expect(se[1]).toBe('SELECT * FROM Product WHERE name = ? AND id = ?  LIMIT 1')
    expect(se[2]).toEqual(['water', 2])
})

test('Gett function with conditions(id and name) and fields', async () => {
    var se = await Product.gett({
        name: 'water',
        id: 2
    }).fi(["name"], true)
    expect(se[0]).toBe('result')
    expect(se[1]).toBe('SELECT  name FROM Product WHERE name = ? AND id = ?  LIMIT 1')
    expect(se[2]).toEqual(['water', 2])
})

test('Insert function with data and field', () => {
    Product.insert([33, "newname"]).fi(["id", "name"])
    expect(Product.query).toBe('INSERT INTO Product ( id, name) VALUES ( ?, ?)')
    expect(Product.dataList).toEqual([33, "newname"])
})

test('Insert function with data', () => {
    Product.insert([55, "nename"])
    expect(Product.query).toBe('INSERT INTO Product  VALUES ( ?, ?)')
    expect(Product.dataList).toEqual([55, "nename"])
})

test('Insert function without data', () => {
    expect(() => {
        Product.insert()
    }).toThrow()
})

test('Update function with condition, values and fields', async () => {
    var sh = await Product.update(350, ["allnew"]).fi(["name"], true)
    expect(sh[0]).toBe('result')
    expect(sh[1]).toBe('UPDATE Product SET  name = ? WHERE id = ?')
    expect(sh[2]).toEqual(["allnew", 350])
})

test('Update function with condition and fields no value', async () => {
    expect(() => {
        Product.update(350).fi(["name"], true)
    }).toThrow()
})

test('Update function with value and fields no condition', async () => {
    expect(() => {
        Product.update(["allnew"]).fi(["name"], true)
    }).toThrow()
})
