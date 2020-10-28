const express = require('express'),
      app = express(),
      path = require('path'),
      bodyParser = require('body-parser'),
      server = require('http').createServer(app),
      { Pool, Client } = require('pg'),
      QueryStream = require('pg-query-stream'),
      JSONStream = require('JSONStream'),
      { config } = require('./config/config'),
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

app.post('/getArtistsData', async function(req,res){
  const artists = req.body.artists;

  const artistAliasObject = new Object();
  const artistsObject = new Object();
  const artistCreditsObject = new Object();
  const artistCreditNameObject = new Object();
  const releasesObject = new Object();
  const tracksObject = new Object();
  const labelReleaseObject = new Object();
  const labelsObject = new Object();
  const labelRelationshipsObject = new Object();
  const artistLabelRelationshipsObject = new Object();
  const artistRelationshipsObject = new Object();
  const recordingRelationshipsObject = new Object();

  try {
    // let artistsInfo = new Array();
    // let artistRelationships = new Array();
    // let artistLabelRelationships = new Array();
    // let recordingRelationships = new Array();
    // let artistAlias = new Array();
    // let artistCredits = new Array();
    // let artistCreditName = new Array();
    // let tracks = new Array();
    // let releases = new Array();
    // let releaseLabel = new Array();
    // let labels = new Array();
    // let labelRelationships = new Array();

    console.time("artistCredits");
    await Promise.all(artists.map(async(artistId) => {
      const results = await getArtistCredits(artistId);

      Promise.all(results.map((result) => {
        if(!artistCreditsObject[result.id]){
          artistCreditsObject[result.id] = {
            id: result.id
          }
        }
      }));
      
      return;
    }));
    console.timeEnd("artistCredits");
    
    console.time("artist_credit_name");
    await Promise.all(Object.entries(artistCreditsObject).map(async([key, { id }]) => {
      const results = await getArtistCreditName(id)

      await Promise.all(results.map((credit) => {
        if(!artistCreditNameObject[credit["Credit ID"]]){
          artistCreditNameObject[credit["Credit ID"]] = {
            creditId: credit["Credit ID"],
            artists: new Object()
          }
  
          artistCreditNameObject[credit["Credit ID"]].artists[credit["Artist ID"]] = {
            artistsId: credit["Artist ID"]
          }
  
          return;
        }
  
        if(artistCreditNameObject[credit["Credit ID"]]){
          if(!artistCreditNameObject[credit["Credit ID"]].artists[credit["Artist ID"]]){
            artistCreditNameObject[credit["Credit ID"]].artists[credit["Artist ID"]] = {
              artistsId: credit["Artist ID"]
            }
          }
        }
  
        return;
      }));

      return;
    }));
    console.timeEnd("artist_credit_name");
    
    console.time("releases");
    await Promise.all(Object.entries(artistCreditsObject).map(async([key, { id }]) => {
      const results = await getReleases(id);

      await Promise.all(results.map((release) => {
        if(!releasesObject[release["Release ID"]]){
          releasesObject[release["Release ID"]] = {
            id: release["Release ID"],
            release: release["Release"],
            type: release["Type"],
            releaseCredit: release["Release Credit"],
            creditId: release["Credit ID"]
          }
  
          return;
        }
  
        return;
      }));

      return;
    }));
    console.timeEnd("releases");
    
    console.time("release_label");
    await Promise.all(Object.entries(releasesObject).map(async([key, { id }]) => {
      const results = await getReleaseLabel(id);

      await Promise.all(results.map((relation) => {
        if(!labelReleaseObject[relation["Release ID"]]){
          labelReleaseObject[relation["Release ID"]] = {
            releaseId: relation["Release ID"],
            labels: new Object()
          }
  
          labelReleaseObject[relation["Release ID"]].labels[relation["Label ID"]] = {
            labelId: relation["Label ID"]
          }
  
          return;
        }
  
        if(labelReleaseObject[relation["Release ID"]]){
          if(!labelReleaseObject[relation["Release ID"]].labels[relation["Label ID"]]){
            labelReleaseObject[relation["Release ID"]].labels[relation["Label ID"]] = {
              labelId: relation["Label ID"]
            }
          }
        }
  
        return;
      }));

      return;
    }));
    console.timeEnd("release_label");
    
    console.time("tracks");
    await Promise.all(Object.entries(releasesObject).map(async([key, { id }]) => {
      const results = await getArtistTracks(id);

      await Promise.all(results.map((track) => {
        if(!tracksObject[track["Track ID"]]){
          tracksObject[track["Track ID"]] = {
            id: track["Track ID"],
            trackName: track["Track Name"],
            releaseCredit: track["Release Credit"],
            releaseId: track["Release ID"],
            creditId: track["Credit ID"],
            recordingId: track["Recording ID"]
          };
  
          return;
        }
  
        return;
      }));

      return;
    }));
    console.timeEnd("tracks");

    console.time("labels");
    await Promise.all(Object.entries(releasesObject).map(async([key, { id }]) => {
      const results = await getReleaseLabelInfo(val.releaseId);

      await Promise.all(results.map((label) => {
        if(!labelsObject[label["Label ID"]]){
          labelsObject[label["Label ID"]] = label;
          
          return;
        }
  
        return;
      }));

      return;
    }));
    console.timeEnd("labels");
    
    console.time("labelRelationships");
    await Promise.all(Object.entries(labelsObject).map(async([key, val]) => {
      const results = await getLabelRelationships(val["Label ID"]);

      await Promise.all(results.map((result) => {
        if(!labelRelationshipsObject[result.id]){
          labelRelationshipsObject[result.id] = result;
        }
      }))

      return;
    }));
    console.timeEnd("labelRelationships");

    console.time("recording relationship");
    await Promise.all(Object.entries(tracksObject).map(async([key, val]) => {
      const results = await getRecordingRelationship(val)

      await Promise.all(results.map((result) => {
        if(!recordingRelationshipsObject[result.id]){
          recordingRelationshipsObject[result.id] = result;
        }
      }))

      return;
    }));
    console.timeEnd("recording relationship");
    
    console.time("tracks");
    await Promise.all(Object.entries(recordingRelationshipsObject).map(async([key, { entityNum, entity0, entity1}]) => {
      if(entityNum === 0){
        const results = await getArtistTracksFromRecording(entity0);

        await Promise.all(results.map((track) => {
          if(!tracksObject[track["Track ID"]]){
            tracksObject[track["Track ID"]] = {
              "Track ID": track["Track ID"],
              "Track Name": track["Track Name"],
              "Release Credit": track["Release Credit"],
              "Release ID": track["Release ID"],
              "Credit ID": track["Credit ID"],
              "Recording ID": track["Recording ID"]
            };
    
            return;
          }
    
          return;
        }));

        return;
      }

      if(entityNum === 1){
        const results = await getArtistTracksFromRecording(entity1);

        await Promise.all(results.map((track) => {
          if(!tracksObject[track["Track ID"]]){
            tracksObject[track["Track ID"]] = {
              "Track ID": track["Track ID"],
              "Track Name": track["Track Name"],
              "Release Credit": track["Release Credit"],
              "Release ID": track["Release ID"],
              "Credit ID": track["Credit ID"],
              "Recording ID": track["Recording ID"]
            };
    
            return;
          }
    
          return;
        }));

        return;
      }

      return;
    }));
    console.timeEnd("tracks");
  
    
    console.time("artist_credit_name");
    await Promise.all(Object.entries(tracksObject).map(async([key, val]) => {
      if(!artistCreditNameObject[val["Credit ID"]]){
        const results = await getArtistCreditName(val["Credit ID"])

        await Promise.all(results.map((credit) => {
          if(!artistCreditNameObject[credit["Credit ID"]]){
            artistCreditNameObject[credit["Credit ID"]] = {
              creditId: credit["Credit ID"],
              artists: new Object()
            }
    
            artistCreditNameObject[credit["Credit ID"]].artists[credit["Artist ID"]] = {
              artistsId: credit["Artist ID"]
            }
    
            return;
          }
    
          if(artistCreditNameObject[credit["Credit ID"]]){
            if(!artistCreditNameObject[credit["Credit ID"]].artists[credit["Artist ID"]]){
              artistCreditNameObject[credit["Credit ID"]].artists[credit["Artist ID"]] = {
                artistsId: credit["Artist ID"]
              }
            }
          }
    
          return;
        }));
      }

      return;
    }));
    console.timeEnd("artist_credit_name");
    
    console.time("Feature artistsInfo");
    await Promise.all(Object.entries(artistCreditNameObject).map(async([key, val]) => {
      await Promise.all(Object.entries(val.artists).map(async([key, { artistsId }]) => {
        const results = await getArtistInfo(artistsId)

        await Promise.all(results.map((artistInfo) => {
          if(!artistsObject[artistInfo["Artist ID"]]){
            artistsObject[artistInfo["Artist ID"]] = {
              artistId: artistInfo["Artist ID"],
              stageName: artistInfo["Stage Name"],
              origin: artistInfo["Origin"],
              type: artistInfo["Type"],
              born: artistInfo["Born"],
              gender: artistInfo["Gender"],
              comment: artistInfo["Comment"],
            }
    
            return;
          }
    
          return;
        }));
      }))
        
      return;
    }));
    console.timeEnd("Feature artistsInfo");
    
    console.time("artistRelationships");
    await Promise.all(Object.entries(artistsObject).map(async([key, val]) => {
      // if(artistInfo["Artist ID"] !== artists[0] && artistInfo["Artist ID"] !== artists[1]){
        const results = await getArtistRelationships(val.artistId)

        await Promise.all(results.map((result) => {
          if(!artistRelationshipsObject[result.id]){
            artistRelationshipsObject[result.id] = result;
          }
        }))

        return;
      // }
      
      return;
    }));
    console.timeEnd("artistRelationships")

    console.time("artistLabelRelationships");
    await Promise.all(Object.entries(artistsObject).map(async([key, val]) => {
      // if(artistInfo["Artist ID"] !== artists[0] && artistInfo["Artist ID"] !== artists[1]){
        const results = await getArtistLabelRelationships(val.artistId)

        await Promise.all(results.map((result) => {
          if(!artistLabelRelationshipsObject[result.id]){
            artistLabelRelationshipsObject[result.id] = result;
          }
        }))

        return;
      // }
      
      return;
    }));
    console.timeEnd("artistLabelRelationships")
    
    console.time("artistAlias");
    await Promise.all(Object.entries(artistsObject).map(async([key, val]) => {
      const results = await getArtistAlias(val.artistId)

      await Promise.all(results.map((alias) => {
        if(!artistAliasObject[alias["Artist ID"]]){
          artistAliasObject[alias["Artist ID"]] = new Array();
        }
  
        artistAliasObject[alias["Artist ID"]].push(alias);
      }));

      return;
    }));
    console.timeEnd("artistAlias")

    console.time("artistInfo");
    await Promise.all(Object.entries(artistRelationshipsObject).map(async([key, { entity0, entity1}]) => {
      if(!artistsObject[entity0]){
        const results = await getArtistInfo(entity0);

        await Promise.all(results.map((artistInfo) => {
          if(!artistsObject[artistInfo["Artist ID"]]){
            artistsObject[artistInfo["Artist ID"]] = {
              artistId: artistInfo["Artist ID"],
              stageName: artistInfo["Stage Name"],
              origin: artistInfo["Origin"],
              type: artistInfo["Type"],
              born: artistInfo["Born"],
              gender: artistInfo["Gender"],
              comment: artistInfo["Comment"],
            }
    
            return;
          }
    
          return;
        }));
      }

      if(!artistsObject[entity1]){
        const results = await getArtistInfo(entity1);

        await Promise.all(results.map((artistInfo) => {
          if(!artistsObject[artistInfo["Artist ID"]]){
            artistsObject[artistInfo["Artist ID"]] = {
              artistId: artistInfo["Artist ID"],
              stageName: artistInfo["Stage Name"],
              origin: artistInfo["Origin"],
              type: artistInfo["Type"],
              born: artistInfo["Born"],
              gender: artistInfo["Gender"],
              comment: artistInfo["Comment"],
            }
    
            return;
          }
    
          return;
        }));
      }

      return;
    }));
    console.timeEnd("artistInfo");
    
    console.time("release");
    await Promise.all(Object.entries(tracksObject).map(async([key, val]) => {
      if(!releasesObject[val["Release ID"]]){
        const results = await getReleasesById(val["Release ID"])

        await Promise.all(results.map((release) => {
          if(!releasesObject[release["Release ID"]]){
            releasesObject[release["Release ID"]] = {
              releaseId: release["Release ID"],
              release: release["Release"],
              type: release["Type"],
              releaseCredit: release["Release Credit"],
              creditId: release["Credit ID"]
            }
    
            return;
          }
    
          return;
        }));
    
      }

      return;
    }));
    console.timeEnd("release");
    
    console.time("labels");
    await Promise.all(Object.entries(artistLabelRelationshipsObject).map(async([key, { entity1 }]) => {
      if(!labelsObject[entity1]){
        const results = await getLabelInfo(entity1);

        await Promise.all(results.map((label) => {
          if(!labelsObject[label["Label ID"]]){
            labelsObject[label["Label ID"]] = label;
            
            return;
          }

          return;
        }));
      }
      
      return;
    }));
    console.timeEnd("labels");
    
    console.time("labels");
    await Promise.all(Object.entries(labelRelationshipsObject).map(async([key, { entity0, entity1 }]) => {
      if(!labelsObject[entity0]){
        const results = await getLabelInfo(entity0);

        await Promise.all(results.map((label) => {
          if(!labelsObject[label["Label ID"]]){
            labelsObject[label["Label ID"]] = label;
            
            return;
          }

          return;
        }));
      }

      if(!labelsObject[entity1]){
        const results = await getLabelInfo(entity1);

        await Promise.all(results.map((label) => {
          if(!labelsObject[label["Label ID"]]){
            labelsObject[label["Label ID"]] = label;
            
            return;
          }

          return;
        }));
      }
      
      return;
    }));
    console.timeEnd("labels");
    
    console.log("Converting to objects...");

    console.log("Sending object");

    return res.send(JSON.stringify({
      artistAlias: artistAliasObject,
      artists: artistsObject,
      artistCreditName: artistCreditNameObject,
      releases: releasesObject,
      tracks: tracksObject ,
      releaseLabel: labelReleaseObject,
      labels: labelsObject,
      labelRelationships: labelRelationshipsObject,
      artistLabelRelationships: artistLabelRelationshipsObject,
      artistRelationships: artistRelationshipsObject,
      recordingRelationships: recordingRelationshipsObject
    }));
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

const getArtistAlias = (artistId) => {
  return new Promise(async(resolve, reject) => {
    let responseData = new Array();
    
    const client = await pool.connect();
    const getArtistAliasQuery = `
      SELECT DISTINCT artist_alias.artist AS "Artist ID", artist_alias.id AS "Alias ID", artist_alias.name AS "Artist Alias", artist_alias_type.name AS "Alias Type" FROM artist_alias
      LEFT JOIN artist_alias_type
      ON artist_alias_type.id = artist_alias.type
      WHERE artist_alias.artist = ${artistId};
    `;

    const query = new QueryStream(getArtistAliasQuery);
    const stream = client.query(query);

    stream.on('error', (error) => {
      console.log(error);
      reject(error);

      return client.release();
    });

    stream.on('data', (data) => {
      responseData.push(data);

      // console.log("Artist alias added to response number of items: ", responseData.length);

      return;
    });

    stream.on('end', () => {
      // console.log("Artist alias Query Complete");
      resolve(responseData);

      return client.release();
    });


    return stream.pipe(JSONStream.stringify());
  });
}

const getArtistInfo = (artistId) => {
  return new Promise(async(resolve, reject) => {
    let responseData = new Array();
    
    const client = await pool.connect();
    const getArtistInfoQuery = `
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
      // console.log("Artists Info Query Complete");
      resolve(responseData);

      return client.release();
    });


    return stream.pipe(JSONStream.stringify());
  });
};

const getArtistCredits = (artistId) => {
  return new Promise(async(resolve, reject) => {
    let responseData = new Array();

    const client = await pool.connect();

    const getArtistCredits = `
      SELECT DISTINCT artist_credit.id FROM artist_credit
      LEFT JOIN artist_credit_name
      ON artist_credit_name.artist_credit = artist_credit.id
      WHERE artist_credit_name.artist = ${artistId}
      AND artist_credit.name != 'Various Artists';
    `

    const query = new QueryStream(getArtistCredits);
    const stream = client.query(query);

    stream.on('error', (error) => {
      console.log(error);
      reject(error);

      return client.release();
    });

    stream.on('data', (data) => {
      responseData.push(data);

      // console.log("Track added to response number of items: ", responseData.length);

      return;
    });

    stream.on('end', () => {
      // console.log("Artists Credits Query Complete");
      resolve(responseData);
      
      return client.release();
    });


    return stream.pipe(JSONStream.stringify());
  })
}

const getArtistCreditName = (artistCreditId) => {
  return new Promise(async(resolve, reject) => {
    let responseData = new Array();
    
    const client = await pool.connect();
    const getArtistCreditName = `
      SELECT artist_credit_name.artist AS "Artist ID", artist_credit_name.artist_credit AS "Credit ID" FROM artist_credit_name
      WHERE artist_credit_name.artist_credit = ${artistCreditId};
    `;

    const query = new QueryStream(getArtistCreditName);
    const stream = client.query(query);

    stream.on('error', (error) => {
      console.log(error);
      reject(error);

      return client.release();
    });

    stream.on('data', (data) => {
      responseData.push(data);

      // console.log("Label info added number of items: ", responseData.length);

      return;
    });

    stream.on('end', () => {
      // console.log("Label Query Complete");
      resolve(responseData);

      return client.release();
    });


    return stream.pipe(JSONStream.stringify());
  });
}

const getReleases = (artistCreditId) => {
  return new Promise(async(resolve, reject) => {
    let responseData = new Array();
    
    const client = await pool.connect();
    const getReleases = `
      SELECT DISTINCT artist_credit.id AS "Credit ID", artist_credit.name AS "Release Credit", release.id AS "Release ID", release.name AS "Release", release_group_primary_type.name AS "Type" FROM artist_credit
      RIGHT JOIN release
      ON artist_credit.id = release.artist_credit AND release.artist_credit != 1
      LEFT JOIN release_group
      ON release_group.id = release.release_group
      LEFT JOIN release_group_primary_type
      ON release_group_primary_type.id = release_group.type
      WHERE artist_credit.id = ${artistCreditId};   
    `;
    
    const query = new QueryStream(getReleases);
    const stream = client.query(query);

    stream.on('error', (error) => {
      console.log(error);
      reject(error);

      return client.release();
    });

    stream.on('data', (data) => {     
      responseData.push(data);

      // console.log("Release info added number of items: ", responseData.length);

      return;
    });

    stream.on('end', () => {
      // console.log("Release Info Query Complete")
      resolve(responseData);

      return client.release();
    });


    return stream.pipe(JSONStream.stringify());
  });
}; 

const getReleasesById = (releaseId) => {
  return new Promise(async(resolve, reject) => {
    let responseData = new Array();
    
    const client = await pool.connect();
    const getReleasesById = `
      SELECT DISTINCT artist_credit.id AS "Credit ID", artist_credit.name AS "Release Credit", release.id AS "Release ID", release.name AS "Release", release_group_primary_type.name AS "Type" FROM artist_credit
      RIGHT JOIN release
      ON artist_credit.id = release.artist_credit AND release.artist_credit != 1
      LEFT JOIN release_group
      ON release_group.id = release.release_group
      LEFT JOIN release_group_primary_type
      ON release_group_primary_type.id = release_group.type
      WHERE release.id = ${releaseId};   
    `;
    
    const query = new QueryStream(getReleasesById);
    const stream = client.query(query);

    stream.on('error', (error) => {
      console.log(error);
      reject(error);

      return client.release();
    });

    stream.on('data', (data) => {     
      responseData.push(data);

      // console.log("Release info added number of items: ", responseData.length);

      return;
    });

    stream.on('end', () => {
      // console.log("Release Info Query Complete")
      resolve(responseData);

      return client.release();
    });


    return stream.pipe(JSONStream.stringify());
  });
}; 

const getReleaseLabel = (releaseId) => {
  return new Promise(async(resolve, reject) => {
    let responseData = new Array();
    
    const client = await pool.connect();
    const getReleaseLabel = `
      SELECT release_label.release AS "Release ID", release_label.label AS "Label ID" FROM release_label
      WHERE release_label.release = ${releaseId};
    `;

    const query = new QueryStream(getReleaseLabel);
    const stream = client.query(query);

    stream.on('error', (error) => {
      console.log(error);
      reject(error);

      return client.release();
    });

    stream.on('data', (data) => {
      responseData.push(data);

      // console.log("Label info added number of items: ", responseData.length);

      return;
    });

    stream.on('end', () => {
      // console.log("Label Query Complete");
      resolve(responseData);

      return client.release();
    });


    return stream.pipe(JSONStream.stringify());
  });
}

const getLabelInfo = (labelId) => {
  return new Promise(async(resolve, reject) => {
    let responseData = new Array();
    
    const client = await pool.connect();
    const getLabelInfo = `
      SELECT DISTINCT label.id AS "Label ID", label.name AS "Label Name", label.label_code AS "Label Code", label_type.name AS "Label Type" FROM label
      LEFT JOIN label_type
      ON label_type.id = label.type
      WHERE label.id = ${labelId}
      ORDER BY label.id;
    `;

    const query = new QueryStream(getLabelInfo);
    const stream = client.query(query);

    stream.on('error', (error) => {
      console.log(error);
      reject(error);

      return client.release();
    });

    stream.on('data', (data) => {
      responseData.push(data);

      // console.log("Label info added number of items: ", responseData.length);

      return;
    });

    stream.on('end', () => {
      // console.log("Label Query Complete");
      resolve(responseData);

      return client.release();
    });


    return stream.pipe(JSONStream.stringify());
  });
}

const getReleaseLabelInfo = (releaseId) => {
  return new Promise(async(resolve, reject) => {
    let responseData = new Array();
    
    const client = await pool.connect();
    const getReleaseLabelInfo = `
      SELECT DISTINCT label.id AS "Label ID", label.name AS "Label Name", label.label_code AS "Label Code", label_type.name AS "Label Type" FROM release_label
      LEFT JOIN label
      ON label.id = release_label.label
      LEFT JOIN label_type
      ON label_type.id = label.type
      WHERE release_label.release = ${releaseId}
      ORDER BY label.id;
    `;

    const query = new QueryStream(getReleaseLabelInfo);
    const stream = client.query(query);

    stream.on('error', (error) => {
      console.log(error);
      reject(error);

      return client.release();
    });

    stream.on('data', (data) => {
      responseData.push(data);

      // console.log("Label info added number of items: ", responseData.length);

      return;
    });

    stream.on('end', () => {
      // console.log("Label Query Complete");
      resolve(responseData);

      return client.release();
    });


    return stream.pipe(JSONStream.stringify());
  });
};

const getArtistTracks = (releaseId) => {
  return new Promise(async(resolve, reject) => {
    let responseData = new Array();
    
    const client = await pool.connect();
    const getArtistTracks = `
      SELECT DISTINCT artist_credit.id AS "Credit ID", artist_credit.name AS "Release Credit", track.id AS "Track ID", track.name AS "Track Name", track.recording AS "Recording ID", release.id AS "Release ID" FROM artist_credit
      RIGHT JOIN track
      ON track.artist_credit = artist_credit.id
      LEFT JOIN medium
      ON medium.id = track.medium
      LEFT JOIN release
      ON medium.release = release.id
      WHERE release.id = ${releaseId};
    `;

    const query = new QueryStream(getArtistTracks);
    const stream = client.query(query);

    stream.on('error', (error) => {
      console.log(error);
      reject(error);

      return client.release();
    });

    stream.on('data', (data) => {
      responseData.push(data);

      // console.log("Track added to response number of items: ", responseData.length);

      return;
    });

    stream.on('end', () => {
      // console.log("Tracks Query Complete");
      resolve(responseData);
      
      return client.release();
    });


    return stream.pipe(JSONStream.stringify());
  });
};

const getArtistTracksFromRecording = (recordingId) => {
  return new Promise(async(resolve, reject) => {
    let responseData = new Array();
    
    const client = await pool.connect();
    const getArtistTracksFromRecording = `
      SELECT DISTINCT artist_credit.id AS "Credit ID", artist_credit.name AS "Release Credit", track.id AS "Track ID", track.name AS "Track Name", track.recording AS "Recording ID", release.id AS "Release ID" FROM artist_credit
      RIGHT JOIN track
      ON track.artist_credit = artist_credit.id
      LEFT JOIN medium
      ON medium.id = track.medium
      LEFT JOIN release
      ON medium.release = release.id
      WHERE track.recording = ${recordingId};
    `;

    const query = new QueryStream(getArtistTracksFromRecording);
    const stream = client.query(query);

    stream.on('error', (error) => {
      console.log(error);
      reject(error);

      return client.release();
    });

    stream.on('data', (data) => {
      responseData.push(data);

      // console.log("Track added to response number of items: ", responseData.length);

      return;
    });

    stream.on('end', () => {
      // console.log("Tracks Query Complete");
      resolve(responseData);
      
      return client.release();
    });


    return stream.pipe(JSONStream.stringify());
  });
};

const getLabelRelationships = (labelId) => {
  return new Promise(async(resolve, reject) => {
    let responseData = new Array();
    
    const client = await pool.connect();
    const getLabelRelationships = `
      SELECT * FROM (
        SELECT DISTINCT l_label_label.id, l_label_label.link, l_label_label.entity0, l_label_label.entity1, link_type.name, link_type.description
        FROM l_label_label
        LEFT JOIN link
        ON link.id = l_label_label.link
        LEFT JOIN link_type
        ON link_type.id = link.link_type
        WHERE l_label_label.entity0 = ${labelId}
        OR l_label_label.entity1 = ${labelId}
      ) AS "label_rel"
      WHERE label_rel.name = 'label ownership'
      OR label_rel.name = 'label rename'
      OR label_rel.name = 'imprint';
    `;

    const query = new QueryStream(getLabelRelationships);
    const stream = client.query(query);

    stream.on('error', (error) => {
      console.log(error);
      reject(error);

      return client.release();
    });

    stream.on('data', (data) => {
      responseData.push(data);

      // console.log("Track added to response number of items: ", responseData.length);

      return;
    });

    stream.on('end', () => {
      // console.log("Tracks Query Complete");
      resolve(responseData);
      
      return client.release();
    });


    return stream.pipe(JSONStream.stringify());
  });
}

const getRecordingRelationship = (track) => {
  return new Promise(async(resolve, reject) => {
    let responseData = new Array();
    
    const client = await pool.connect();
    const getRecordingRelationship = `
      SELECT * FROM (
        SELECT DISTINCT l_recording_recording.id, l_recording_recording.link, l_recording_recording.entity0, l_recording_recording.entity1, link_type.name, link_type.description
        FROM l_recording_recording
        LEFT JOIN link
        ON link.id = l_recording_recording.link
        LEFT JOIN link_type
        ON link_type.id = link.link_type
        WHERE l_recording_recording.entity0 = ${track["Recording ID"]}
        OR l_recording_recording.entity1 = ${track["Recording ID"]}
        AND l_recording_recording.entity0 != l_recording_recording.entity1
      ) AS "recording_rel"
      WHERE recording_rel.name = 'samples material';
    `;

    const query = new QueryStream(getRecordingRelationship);
    const stream = client.query(query);

    stream.on('error', (error) => {
      console.log(error);
      reject(error);

      return client.release();
    });

    stream.on('data', (data) => {
      if(data.entity0 === track["Recording ID"]){
        data.entityNum = 1;
      }
      if(data.entity1 === track["Recording ID"]){
        data.entityNum = 0;
      }

      responseData.push(data);
      // console.log("Track added to response number of items: ", responseData.length);

      return;
    });

    stream.on('end', () => {
      // console.log("Tracks Query Complete");
      resolve(responseData);
      
      return client.release();
    });


    return stream.pipe(JSONStream.stringify());
  });
}

const getArtistRelationships = (artistId) => {
  return new Promise(async(resolve, reject) => {
    let responseData = new Array();
    
    const client = await pool.connect();
    const getArtistRelationships = `
      select * FROM (
        SELECT DISTINCT l_artist_artist.id, l_artist_artist.link, l_artist_artist.entity0, l_artist_artist.entity1, link_type.name, link_type.description
        FROM l_artist_artist
        LEFT JOIN link
        ON link.id = l_artist_artist.link
        LEFT JOIN link_type
        ON link_type.id = link.link_type 
        WHERE l_artist_artist.entity0 = ${artistId} 
        OR l_artist_artist.entity1 = ${artistId}
      ) AS artist_rel
      WHERE artist_rel.name = 'member of band'
      OR artist_rel.name = 'parent'
      OR artist_rel.name = 'sibling'
      OR artist_rel.name = 'married'
      OR artist_rel.name = 'subgroup'
      OR artist_rel.name = 'tribute';
    `;

    const query = new QueryStream(getArtistRelationships);
    const stream = client.query(query);

    stream.on('error', (error) => {
      console.log(error);
      reject(error);

      return client.release();
    });

    stream.on('data', (data) => {
      responseData.push(data);

      // console.log("Track added to response number of items: ", responseData.length);

      return;
    });

    stream.on('end', () => {
      // console.log("Tracks Query Complete");
      resolve(responseData);
      
      return client.release();
    });


    return stream.pipe(JSONStream.stringify());
  });
}

const getArtistLabelRelationships = (artistId) => {
  return new Promise(async(resolve, reject) => {
    let responseData = new Array();
    
    const client = await pool.connect();
    const getArtistLabelRelationships = `
      SELECT * FROM (
        SELECT DISTINCT l_artist_label.id, l_artist_label.link, l_artist_label.entity0, l_artist_label.entity1, link_type.name, link_type.description 
        FROM l_artist_label
        LEFT JOIN link
        ON link.id = l_artist_label.link
        LEFT JOIN link_type
        ON link_type.id = link.link_type
        WHERE l_artist_label.entity0 = ${artistId}
      ) AS "artist_label_rel"
      WHERE artist_label_rel.name = 'recording contract'
      OR artist_label_rel.name = 'label founder'
      OR artist_label_rel.name = 'owner'
      OR artist_label_rel.name = 'personal label'
    `;

    const query = new QueryStream(getArtistLabelRelationships);
    const stream = client.query(query);

    stream.on('error', (error) => {
      console.log(error);
      reject(error);

      return client.release();
    });

    stream.on('data', (data) => {
      responseData.push(data);

      // console.log("Track added to response number of items: ", responseData.length);

      return;
    });

    stream.on('end', () => {
      // console.log("Tracks Query Complete");
      resolve(responseData);
      
      return client.release();
    });


    return stream.pipe(JSONStream.stringify());
  });
}
