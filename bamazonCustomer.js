var mysql = require("mysql");
var inquirer = require("inquirer");
var prompt = require("prompt");

var connection = mysql.createConnection({
  
  port: 3306,
  socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon_DB"
});

connection.connect(function(err){
    if(err){
    console.log('Error connecting');
    return;
    }
    console.log('Connection established');

// Function stop to the app
var stopApp = function(){
    return next(err);
}
// Function to start the app
var beginApp = function(){
    connection.query("SELECT * FROM Products", function(err, result) {
        if (err) throw err;
        return (getBamazonProducts(result));
      
      });
}

var schema = {
        properties: {
            ID: {
            message: "Please enter the ID of the product you would like to buy.",
            pattern: /^[0-9][0-9]$|^[0-9]$/,
            required: true
            },
            howMany: {
            message: "Please enter how many you would like to buy.",
            pattern: /^[0-9][0-9]$|^[0-9][0-9][0-9]$/,
            required: true
            }
        }
    };

    var schema2 = {
        properties: {
            AnotherPurchase: {
            message: "Would you like to buy another item?.",
            pattern: /(no|n|yes|y)/,
            required: true
            },
        }
    };

    var getBamazonProducts = function (Products){
        console.log("Welcome to Bamazon!");
        for (var i = 0; i < Products.length; i++) {
            var ProductsResults = "\r\n"+
            "ItemID: " + Products[i].item_id+"\r\n"+
            "Product Description: " + Products[i].product_name+"\r\n"+
            "Department: " + Products[i].department_name+"\r\n"+
            "Price: $ "+ Products[i].price+"\r\n"+
            "Current Stock: " + Products[i].stock_quantity;
            console.log(ProductsResults);
        }
        userSelectID();
    }

  
    var userSelectID = function(){
        prompt.start();
        console.log("Enter the ID # of the product you would like to purchase");

        prompt.get(schema, function (err, result) {
            if (err){
                console.log(err)
            }
           
            var userChoiceID = parseInt(result.ID);
            var userChoiceHowMany = parseInt(result.howMany);
           

           
            var checkInventory = function(){
                connection.query('SELECT * FROM Products WHERE item_id =' + userChoiceID, function(err, result) {
                    if (err) throw err;
                    

                    var userWantsToBuy = userChoiceHowMany;
                    var productInventory = result[0].stock_quantity;
                    var productsPrice = result[0].price;
                    var isInStock = productInventory - userWantsToBuy;
                    var totalCost= productsPrice * userWantsToBuy;

                    if (userWantsToBuy > productInventory || productInventory === 0){
                        console.log("We're sorry, but there isn't enough in stock. Please try again."+"\r\n"+"\r\n");
                        userSelectID();
                    } else {
                        console.log("There are "+result[0].stock_quantity+" of "+result[0].product_name);
                        console.log("You are purchasing "+ userWantsToBuy +" "+result[0].product_name+"s at $"+ result[0].price+" per item.");
                        console.log("Your total is $"+totalCost);
                        connection.query('UPDATE Products SET stock_quantity = '+isInStock+' WHERE item_id ='+userChoiceID, function(err, result){
                        if (err) throw err;
                            connection.query('SELECT item_id, product_name, department_name, price, stock_quantity FROM products WHERE item_id ='+userChoiceID, function(err, result){
                               
                            }); 
                        });
                        prompt.get(schema2, function (err, result) {
                            if (err){
                                console.log(err)
                            }
                            console.log(result);
                            var userAnswer = result.AnotherPurchase;
                            if (userAnswer === "n" || userAnswer === "no"){
                                stopApp();
                            }else{
                                beginApp();
                            }   
                        });
                    }
                  });
            };
            checkInventory();
        });
    }

// start the app
beginApp();
});
