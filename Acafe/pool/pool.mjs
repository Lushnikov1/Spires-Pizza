import { connect } from 'http2';
import mysql from 'mysql'
import mysql2 from 'mysql2/promise'
import util from 'util'


const getPool = () =>{
  const pool =   mysql.createPool({
    connectionLimit: 100000,
    host     : 'localhost',
    port: 8889,
    user     : 'root',
    password : 'root',
    database : 'Brawl_cafe',
  });
  pool.query = util.promisify(pool.query).bind(pool)
  
  return pool
}

const getPoolWithLabels = async () =>{
  const connection =   await mysql2.createConnection({
    host     : 'localhost',
    port: 8889,
    
    user     : 'root',
    password : 'root',
    database : 'Brawl_cafe',
  });
  connection.config.queryFormat = function (query, values) {
    if (!values) return query;
    return query.replace(/\:(\w+)/g, function (txt, key) {
      if (values.hasOwnProperty(key)) {
        return this.escape(values[key]);
      }
      return txt;
    }.bind(this));
  };

  await connection.connect();

  return connection
}

const connection2 = await getPoolWithLabels()

const getConnection = async () =>{
  const connection = await  mysql2.createConnection({
    host     : 'localhost',
    port: 8889,
    user     : 'root',
    password : 'root',
    database : 'Brawl_cafe',
  })
  await connection.connect()
  return connection
}


const connection =   mysql.createConnection({
    host     : 'localhost',
    
    port: 8889,
    user     : 'root',
    password : 'root',
    database : 'Brawl_cafe',
    
  });

const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const con =  util.promisify(connection.connect).bind(connection);
connection.query = util.promisify(connection.query).bind(connection)
connection.connect(function(err){
  if (err) {
      console.log("error connecting: " + err.stack);
      return;
  };
  console.log("connected as... " + connection.threadId);
});



const mainPool =  mysql2.createPool({
  connectionLimit: 10000,
  host     : 'localhost',
  port: 8889,
  user     : 'root',
  password : 'root',
  database : 'Brawl_cafe',

})



  // })
  // .then(async e =>{
  //   const t = await e.query('INSERT INTO `DROPTABLE`(`T`) VALUES (90),(90),(90)')
  //   console.log(t)
  // }).finally(

  // )




export  {
  connection, 
  commit, 
  rollback, 
  beginTransaction, 
  getPool, 
  getConnection, 
  connection2,
  mainPool
}

// class QueryService{
//     constructor(){
//         this.connection = this.makeConnection();
//     }
//     makeQuery(query, params=null){
//         this.connection.query("SELECT 1+1 as test, 23 as ma", (err, [res], d) => {console.log(res.ma)})        
//     }

//     makeConnection(){
//         const connection =  mysql.createConnection({
//             host     : 'localhost',
//             port: 8889,
//             user     : 'root',
//             password : 'root',
//             database : 'db_nastol',
//           });
//           connection.connect()
//        return connection

//     }

// }

