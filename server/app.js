const express = require("express");
const cors = require("cors");
const { Sequelize, Op, Model, DataTypes } = require("sequelize");
const db = require("./models");

const app = express();
app.use(express.json());

app.use(cors({
    origin: "*"
}));

const sequelize = new Sequelize('nd2', 'root', '', {
    host: '127.0.0.1',
    port: '3308',
    dialect: 'mysql',
  });
  sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
  const Cards = sequelize.define("Cards",{
    number:{
        type: DataTypes.STRING,
        primaryKey: true,
        unique: true,
        allowNull:false,
        validate:{
            notEmpty: true,
            isCreditCard: true,
        }
    },
    cvv:{
        type: DataTypes.INTEGER,
        unique: false,
        allowNull:false,
        validate:{
            notEmpty:true,
            isNumeric: true,
            
        }
    },
    date:{
        type: DataTypes.STRING,
        unique: false,
        allowNull:false,
        validate:{
            notEmpty:true,
            
        }
    },
    money:{
        type: DataTypes.FLOAT,
        allowNull:false,
        validate:{
            notEmpty:true,
        }
    }        
},  {timestamps: false,}  
)
  const Operations = sequelize.define("Operations",{
    id:{
        type: DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey: true,
        unique: true,
        allowNull:false,
        validate:{
            notEmpty:true,
        }
    },
    number:{
        type: DataTypes.STRING,
        unique: false,
        allowNull:false,
        validate:{
            notEmpty:true,
            isNumeric: true,
            
        }
    },
    sum:{
        type: DataTypes.FLOAT,
        allowNull:false,
        validate:{
            notEmpty:true,
        }
    },
    operation:{
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true,
        }
    }, date:{
        type: DataTypes.STRING,
        unique: false,
        allowNull:false,
        validate:{
            notEmpty:true,
        }
    },     
},  {timestamps: false,}  
)


const cash = async(req,res)=>{
    const card  = await Cards.findOne({
        where:{
            number: req.body.number,
        }
    }).catch((e)=>{console.log(e);});
    
    if(!card){
        res.sendStatus(404);
    }
    else{
            if(card.cvv == req.body.cvv){
                if(card.date == req.body.date){
                    if(parseFloat(card.money) < parseFloat(req.body.sum)){
                        console.log(parseFloat(card.money));
                        res.sendStatus(402);
                        
                    }else{
                        const update = await Cards.update({ money: parseFloat(card.money)-parseFloat(req.body.sum[0]) }, {
                            where: {
                                number: req.body.number
                            }
                          });  
                          let date = new Date();
                          date.setHours(date.getHours() + 2);
                            const op = Operations.create({id:0,number:req.body.number[0],sum:parseFloat(req.body.sum[0]), date:date.toString(),operation:"isvedimas"})  
                          res.sendStatus(200);  
                    }
                                 
                    
                }else{
                    res.sendStatus(401);
                }
            }
            else{
                res.sendStatus(400);
            }
        }
}
const findcard = async(req, res)=>{
    const card  = await Cards.findOne({
        where:{
            number: req.body.number,
        }
    }).catch((e)=>{console.log(e);});
    
    if(!card){
        res.sendStatus(404);
    }
    else{
            if(card.cvv == req.body.cvv){
                if(card.date == req.body.date){
                    const update = await Cards.update({ money: parseFloat(card.money)+parseFloat(req.body.sum[0]) }, {
                        where: {
                            number: req.body.number
                        }
                      });  
                      let date = new Date();
                    //   date.setHours(date.getHours());
                      console.log(req.body.number);
                      const op = Operations.create({id:0,number:req.body.number[0],sum:parseFloat(req.body.sum[0]), date:date.toString(),operation:"papildymas"})                
                    res.sendStatus(200);
                    
                }else{
                    res.sendStatus(401);
                }
            }
            else{
                res.sendStatus(400);
            }
        }
    }

    

    const getInfo = async(req, res)=>{
        const card  = await Cards.findOne({
            where:{
                number: req.body.number,
            }
        }).catch((e)=>{console.log(e);});
        
        if(!card){
            res.sendStatus(404);
        }
        else{
                if(card.cvv == req.body.cvv){
                    if(card.date == req.body.date){
                        const operations  = await Operations.findAll({
                            where:{
                                number: req.body.number,
                            }
                        }).catch((e)=>{console.log(e);});       
                        res.status(200).send({"card":card,"operations":operations});
                        
                    }else{
                        res.sendStatus(401);
                    }
                }
                else{
                    res.sendStatus(400);
                }
            }
        }



app.post("/getCard", async(req,res)=>{
    findcard(req, res);
});
app.post("/cash", async(req,res)=>{
    cash(req, res);
});
app.post("/getInfo", async(req,res)=>{
    getInfo(req, res);
});

// const db = require("./models");

// const {User} = require("./models");

app.use(cors({
    origin: "*"
}));



async function sync () {
    await sequelize.sync({alter:true});
  }
  sync();

async function add(){
    const card = await Cards.create({ number: "4862447702315534", cvv: "321", date: "07/29", money:"110152200.221"});
}
// add();
console.log("All models were synchronized successfully.");
app.listen(3001, ()=>{
    console.log("server running");
});