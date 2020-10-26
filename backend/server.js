const express = require('express'),
      app = express(),
      path = require('path'),
      bodyParser = require('body-parser'),
      server = require('http').createServer(app),
      { Pool, Client } = require('pg'),
      QueryStream = require('pg-query-stream'),
      JSONStream = require('JSONStream'),
      { config } = require('./config/config'),
      { getArtistNeighbors } = require('./neighbors/artist/artistNeighbors'),
      { getStartNodeNeighbors } = require('./neighbors/artist/startNodeNeighbors'),
      { getReleaseNeighbors } = require('./neighbors/release/releaseNeighbors'),
      { getTrackNeighbors } = require('./neighbors/track/trackNeighbors'),
      { getLabelNeighbors } = require('./neighbors/label/labelNeighbors')
      fs = require('fs'),
      csvParse = require('csv-parser');
      

const html = path.resolve('./frontend/html'),
      css = path.resolve('./frontend/css'),
      js = path.resolve('./frontend/js'),
      bootstrap = path.resolve('./node_modules/bootstrap/dist'),
      jquery = path.resolve('./node_modules/jquery'),
      images = path.resolve('./frontend/images');

//Creating static files located on localhost
app.use('/html', express.static(html));
app.use('/css', express.static(css));
app.use('/js', express.static(js));
app.use('/bootstrap', express.static(bootstrap));
app.use('/jquery', express.static(jquery));
app.use('/images', express.static(images));

app.use(bodyParser.json());

const pool = new Pool({
  user: config.user,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port,
})

server.listen(process.env.PORT || 3000);
console.log('Server running on port: ',process.env.PORT || 3000);

let v8 = require("v8");
let totalHeapSizeInGB = (((v8.getHeapStatistics().total_available_size) / 1024 / 1024 / 1024).toFixed(2));
console.log(`*******************************************`);
console.log(`Total Heap Size ~${totalHeapSizeInGB}GB`);
console.log(`*******************************************`);

// const artistss = [600808, 800841];

// const artistsObject = {};
// const releasesObject = {};
// // const tracksOutput = {};
// const labelsObject = {};

// artistInfoStream = fs.createReadStream('./backend/artist_info.csv');
// artistsCredits = fs.createReadStream('./backend/artistsCredits.csv');
// releasesStream = fs.createReadStream('./backend/releases.csv');
// // tracksStream = fs.createReadStream('./backend/tracks.csv');
// labelsStream = fs.createReadStream('./backend/labels.csv');

// artistInfoStream.pipe(csvParse({
//   delimiter: ',',
//   trim: true,
//   skip_empty_lines: true,
//   objname: true
// })).on('readable', function(){
//   let record;
  
//   while (record = this.read()) {
//     if(!artistsObject[record["Artist ID"]]){
//       artistsObject[record["Artist ID"]] = {
//         artistId: record["Artist ID"],
//         stageName: record["Stage Name"],
//         origin: record["Origin"],
//         type: record["Type"],
//         born: record["Born"],
//         gender: record["Gender"],
//         comment: record["Comment"],
//         aliases: new Object()
//       }
  
//       artistsObject[record["Artist ID"]].aliases[record["Alias ID"]] = {
//         aliasId: record["Alias ID"],
//         aliasType: record["Alias Type"],
//         alias: record["Artist Alias"]
//       }
//     }
  
//     if(!artistsObject[record["Artist ID"]].aliases[record["Alias ID"]]){
//       artistsObject[record["Artist ID"]].aliases[record["Alias ID"]] = {
//         aliasId: record["Alias ID"],
//         aliasType: record["Alias Type"],
//         alias: record["Artist Alias"]
//       }
//     }
//   }
// }).on('end', function(){
//   console.log("All artists info stored");
// });

// releasesStream.pipe(csvParse({
//   delimiter: ',',
//   trim: true,
//   skip_empty_lines: true,
//   objname: true
// })).on('readable', function(){
//   let record;

//   while (record = this.read()) {
//     let duplicateLabel = false;
//     let duplicateArtist = false;

//     if(!releasesObject[record["Release ID"]]){
//       releasesObject[record["Release ID"]] = {
//         releaseId: record["Release ID"],
//         release: record["Release"],
//         type: record["Type"],
//         releaseCredit: record["Release Credit"],
//         labels: record["Label ID"] ? [record["Label ID"]] : [],
//         artists: record["Artist ID"] ? [record["Artist ID"]] : []
//       }
//     }

//     releasesObject[record["Release ID"]].labels.forEach((labelId) => {
//       if(record["Label ID"] && labelId === record["Label ID"]){
//         duplicateLabel = true;
//       }
//     });

//     releasesObject[record["Release ID"]].artists.forEach((artistId) => {
//       if(record["Artist ID"] && artistId === record["Artist ID"]){
//         duplicateArtist = true;
//       }
//     })
    
//     if(!duplicateLabel){
//       releasesObject[record["Release ID"]].labels.push(record["Label ID"]);
//     }

//     if(!duplicateArtist){
//       releasesObject[record["Release ID"]].artists.push(record["Artist ID"]);
//     }
//   }
// }).on('end', function(){
//   console.log("All releases stored");
// });

// // tracksStream.pipe(csvParse({
// //   delimiter: ',',
// //   trim: true,
// //   skip_empty_lines: true,
// //   objname: true
// // })).on('readable', function(){
// //   let tmpArray = [];
// //   let record;

// //   while (record = this.read()) {
// //     tmpArray.push(record);
// //   }

// //   tracksOutput.concat(tmpArray);
// // }).on('end', function(){
// //   // console.log(tracksOutput)
// // });

// labelsStream.pipe(csvParse({
//   delimiter: ',',
//   trim: true,
//   skip_empty_lines: true,
//   objname: true
// })).on('readable', function(){
//   let record;

//   while (record = this.read()) {
//     if(!labelsObject[record["Label ID"]]){
//       labelsObject[record["Label ID"]] = record;
//     }
//   }
// }).on('end', function(){
//   console.log("All labels stored")
// });



app.get('/', function(req,res){
  res.sendFile(html+'/home.html');
});

app.get('/', function(req,res){
  res.sendFile(html+'/home.html');
});

app.post('/getArtistsSuggestions', async function(req, res){
  const searchText = req.body.text;

  try {
    let artistsInfo = await getArtistInfoSuggestions(searchText);
    
    const artistsObject = new Object();

    artistsInfo.forEach((artistInfo) => {
      if(!artistsObject[artistInfo["Artist ID"]]){
        artistsObject[artistInfo["Artist ID"]] = {
          artistId: artistInfo["Artist ID"],
          stageName: artistInfo["Stage Name"],
          origin: artistInfo["Origin"],
          type: artistInfo["Type"],
          born: artistInfo["Born"],
          gender: artistInfo["Gender"],
          comment: artistInfo["Comment"],
          aliases: new Object()
        }

        artistsObject[artistInfo["Artist ID"]].aliases[artistInfo["Alias ID"]] = {
          aliasId: artistInfo["Alias ID"],
          aliasType: artistInfo["Alias Type"],
          alias: artistInfo["Artist Alias"]
        }

        return;
      }

      if(!artistsObject[artistInfo["Artist ID"]].aliases[artistInfo["Alias ID"]]){
        artistsObject[artistInfo["Artist ID"]].aliases[artistInfo["Alias ID"]] = {
          aliasId: artistInfo["Alias ID"],
          aliasType: artistInfo["Alias Type"],
          alias: artistInfo["Artist Alias"]
        }

        return;
      }

      return;
    });

    res.send(artistsObject);
  } catch (error) {
    console.log(error)
    throw new Error(error);
  }
});

app.post('/getArtistNeighbors', async function(req,res){ 
  try {
    const neighbors = await getArtistNeighbors(pool, req.body.artist);

    console.log("Converting to objects...");

    console.log("Sending object");

    return res.send(neighbors);
  } catch (error) {
    console.log(error)
    throw new Error(error);
  }
});

app.post('/getStartNodeNeighbors', async function(req,res){ 
  try {
    const neighbors = await getStartNodeNeighbors(pool, req.body.artist);

    console.log("Converting to objects...");

    console.log("Sending object");

    return res.send(neighbors);
  } catch (error) {
    console.log(error)
    throw new Error(error);
  }
});

app.post('/getReleaseNeighbors', async function(req,res){ 
  try {
    const neighbors = await getReleaseNeighbors(pool, req.body.release);
    
    console.log("Converting to objects...");

    console.log("Sending object");

    return res.send(neighbors);
  } catch (error) {
    console.log(error)
    throw new Error(error);
  }
});

app.post('/getTrackNeighbors', async function(req,res){ 
  try {
    const neighbors = await getTrackNeighbors(pool, req.body.track);

    console.log("Converting to objects...");

    console.log("Sending object");

    return res.send(neighbors);
  } catch (error) {
    console.log(error)
    throw new Error(error);
  }
});

app.post('/getLabelNeighbors', async function(req,res){ 
  try {
    const neighbors = await getLabelNeighbors(pool, req.body.label);

    console.log("Converting to objects...");

    console.log("Sending object");

    return res.send(neighbors);
  } catch (error) {
    console.log(error)
    throw new Error(error);
  }
});

app.post('/getArtist', async function(req,res){ 
  try {
    const artistsObject = new Object();
    const artistsInfo = await getArtist(pool, req.body.artist);

    Promise.all(artistsInfo.map((artistInfo) => {
      if(!artistsObject[artistInfo["Artist ID"]]){
        artistsObject[artistInfo["Artist ID"]] = {
          id: artistInfo["Artist ID"],
          stageName: artistInfo["Stage Name"],
          origin: artistInfo["Origin"],
          type: artistInfo["Type"],
          born: artistInfo["Born"],
          gender: artistInfo["Gender"],
          comment: artistInfo["Comment"],
          type: "artist"
        }
      }
    }));

    console.log("Converting to objects...");

    console.log("Sending object");

    return res.send(JSON.stringify(artistsObject));
  } catch (error) {
    console.log(error)
    throw new Error(error);
  }
});

const getArtistInfoSuggestions = (searchText) => {
  return new Promise(async(resolve, reject) => {
    let responseData = new Array();
    
    const client = await pool.connect();
    const getArtistInfoQuery = `
      SELECT DISTINCT artist_alias.id AS "Alias ID", artist_alias.name AS "Artist Alias", artist_alias_type.name AS "Alias Type" , artist.id AS "Artist ID", artist.name AS "Stage Name", artist.comment AS "Comment", artist_type.name AS "Type", gender.name AS "Gender", area.name AS "Origin",
      COALESCE(
        concat(
          CASE WHEN artist.begin_date_month IS NULL
          THEN NULL
          ELSE concat(artist.begin_date_month, '/')
          END,
          CASE WHEN artist.begin_date_day IS NULL
          THEN NULL
          ELSE concat(artist.begin_date_day, '/')
          END,
          CASE WHEN artist.begin_date_year IS NULL
          THEN NULL
          ELSE concat(artist.begin_date_year)
          END
        ),
        'NULL'
      ) 
      AS "Born" 
      FROM artist_alias
      LEFT JOIN artist_alias_type
      ON artist_alias_type.id = artist_alias.type
      RIGHT JOIN artist
      ON artist.id = artist_alias.artist
      LEFT JOIN artist_type
      ON artist_type.id = artist.type
      LEFT JOIN gender
      ON gender.id = artist.gender
      LEFT JOIN area
      ON area.id = artist.area
      WHERE artist.name ILIKE '${searchText}%'
      ORDER BY artist.name
      LIMIT 10;
    `;

    const query = new QueryStream(getArtistInfoQuery);
    const stream = client.query(query);

    stream.on('error', (error) => {
      console.log(error);
      reject(error);

      return client.release();
    });

    stream.on('data', (data) => {
      responseData.push(data);

      // console.log("Artist info added to response number of items: ", responseData.length);

      return;
    });

    stream.on('end', () => {
      // console.log("Query Complete");
      resolve(responseData);

      return client.release();
    });


    return stream.pipe(JSONStream.stringify());
  });
};

const getArtist = (pool, artistId) => {
  return new Promise(async(resolve, reject) => {
    let responseData = new Array();
    
    const client = await pool.connect();
    const getArtistQuery = `
      SELECT artist.id AS "Artist ID", artist.name AS "Stage Name",  artist.comment AS "Comment", artist_type.name AS "Type", gender.name AS "Gender", area.name AS "Origin",
      COALESCE(
        concat(
          CASE WHEN artist.begin_date_month IS NULL
          THEN NULL
          ELSE concat(artist.begin_date_month, '/')
          END,
          CASE WHEN artist.begin_date_day IS NULL
          THEN NULL
          ELSE concat(artist.begin_date_day, '/')
          END,
          CASE WHEN artist.begin_date_year IS NULL
          THEN NULL
          ELSE concat(artist.begin_date_year)
          END
        ),
        'NULL'
      ) 
      AS "Born"
      FROM artist
      LEFT JOIN artist_type
      ON artist_type.id = artist.type
      LEFT JOIN gender
      ON gender.id = artist.gender
      LEFT JOIN area
      ON area.id = artist.area
      WHERE artist.id = ${artistId};
    `;

    const query = new QueryStream(getArtistQuery);
    const stream = client.query(query);

    stream.on('error', (error) => {
      console.log(error);
      reject(error);

      return client.release();
    });

    stream.on('data', (data) => {
      responseData.push(data);

      // console.log("Artist info added to response number of items: ", responseData.length);

      return;
    });

    stream.on('end', () => {
      // console.log("Artists Info Query Complete");
      resolve(responseData);

      return client.release();
    });


    return stream.pipe(JSONStream.stringify());
  });
};












