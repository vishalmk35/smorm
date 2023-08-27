let smorm = require('./main.js')
var Products = new smorm('Products', 'Productid')
  
async function eh() {
    var ddh = Products.update(2, ['brandnewname', 'Yo new description']).fi(['ProductName', 'ProductDesc'], true)
    console.log(await ddh)                                                                                                
  }
   
eh()

