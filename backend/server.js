const express = require('express'),
      app = express(),
      path = require('path'),
      bodyParser = require('body-parser'),
      server = require('http').createServer(app),
      { Pool, Client } = require('pg'),
      QueryStream = require('pg-query-stream'),
      JSONStream = require('JSONStream'),
      { config } = require('./config/config'),
      redis = require("redis");
      redisClient = redis.createClient();
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
      
      Object.entries(results).forEach((result) => {
        const resultId = parseInt(result[0]);

        if(!artistCreditsObject[resultId]){
          artistCreditsObject[resultId] = {
            id: resultId
          }
        }
      })
      
      return;
    }));
    console.timeEnd("artistCredits");

    console.time("artist_credit_name");
    await Promise.all(Object.entries(artistCreditsObject).map(async([key, { id }]) => {
      const results = await getArtistCreditName(id);

      await Promise.all(Object.entries(results).map((result) => {
        const credit = result[1].split(",");

        const artistId = parseInt((credit[0].split(":")[1]).replace(/\s"{|}"+/g, ""));
        const creditId = parseInt((credit[1].split(":")[1]).replace(/\s"{|}"+/g, ""));

        if(!artistCreditNameObject[creditId]){
          artistCreditNameObject[creditId] = {
            creditId: creditId,
            artists: new Object()
          }
  
          artistCreditNameObject[creditId].artists[artistId] = {
            artistsId: artistId
          }
  
          return;
        }
  
        if(artistCreditNameObject[creditId]){
          if(!artistCreditNameObject[creditId].artists[artistId]){
            artistCreditNameObject[creditId].artists[artistId] = {
              artistsId: artistId
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
      
      if(results){
        await Promise.all(Object.entries(results).map((result) => {
          const releaseInfo = result[1].split(",");

          const creditId = parseInt((releaseInfo[0].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          const credit = (releaseInfo[1].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
          const id = parseInt((releaseInfo[2].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          const release = (releaseInfo[3].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
          const releaseType = (releaseInfo[4].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");

          if(!releasesObject[id]){
            releasesObject[id] = {
              id: id,
              release: release,
              releaseType: releaseType,
              releaseCredit: credit,
              creditId: creditId
            }
    
            return;
          }
    
          return;
        }));
      }
      
      return;
    }));
    console.timeEnd("releases");
    
    console.time("release_label");
    await Promise.all(Object.entries(releasesObject).map(async([key, { id }]) => {
      const results = await getReleaseLabel(id);
      
      if(results){
        await Promise.all(Object.entries(results).map((result) => {
          const relation = result[1].split(",");
          
          const releaseId = parseInt((relation[0].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          const labelId = parseInt((relation[1].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));

          if(!labelReleaseObject[releaseId]){
            labelReleaseObject[releaseId] = {
              releaseId: releaseId,
              labels: new Object()
            }
            
            if(labelId){
              labelReleaseObject[releaseId].labels[labelId] = {
                labelId: labelId
              }
            }
    
            return;
          }
    
          if(labelReleaseObject[releaseId]){
            if(!labelReleaseObject[releaseId].labels[labelId]){
              if(labelId){
                labelReleaseObject[releaseId].labels[labelId] = {
                  labelId: labelId
                }
              }
            }
          }
    
          return;
        }));
      }

      return;
    }));
    console.timeEnd("release_label");
    
    console.time("tracks");
    await Promise.all(Object.entries(artistCreditsObject).map(async([key, { id }]) => {
      const results = await getArtistTracks(id);

      if(results){
        await Promise.all(Object.entries(results).map((result) => {
          const track = result[1].split(",");

          const creditId = parseInt((track[0].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          const credit = (track[1].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
          const id = parseInt((track[2].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          const trackName = (track[3].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
          const recordingId = (track[4].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
          const releaseId = (track[5].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");

          if(!tracksObject[id]){
            tracksObject[id] = {
              id: id,
              trackName: trackName,
              releaseCredit: credit,
              releaseId: releaseId,
              creditId: creditId,
              recordingId: recordingId
            };
    
            return;
          }
    
          return;
        }));
      }

      return;
    }));
    console.timeEnd("tracks");

    console.time("labels");
    await Promise.all(Object.entries(labelReleaseObject).map(async([key, { labels }]) => {
      await Promise.all(Object.entries(labels).map(async([key, {labelId}]) => {
        const result = await getLabelInfo(labelId);
        
        if(result){
          const label = result.split(",");

          const id = parseInt((label[0].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          const name = (label[1].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
          const code = parseInt((label[2].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          const labelType = (label[3].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");

          if(!labelsObject[id]){
            labelsObject[id] = {
              id: id,
              name: name,
              code: code,
              labelType: labelType
            }
          }
                
          return;
        }
      }))
    }));
    console.timeEnd("labels");
    
    console.time("labelRelationships");
    await Promise.all(Object.entries(labelsObject).map(async([key, { id }]) => {
      const results = await getLabelRelationships(id);

      if(results){
        await Promise.all(Object.entries(results).map((result) => {
          const label = result[1].split(",");
          
          const label1 = parseInt((label[0].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          const label2 = parseInt((label[1].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));

          if(!labelRelationshipsObject[label1]){
            labelRelationshipsObject[label1] = {
              label1: label1,
              label2: label2
            }
          }
        }))
      }

      return;
    }));
    console.timeEnd("labelRelationships");

    console.time("recording relationship");
    await Promise.all(Object.entries(tracksObject).map(async([key, {id}]) => {
      const results = await getRecordingRelationship(id);

      if(results){
        await Promise.all(Object.entries(results).map((result) => {
          const track = result[1].split(",");
          
          const track1 = parseInt((track[0].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          const artist1 = parseInt((track[1].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          const track2 = parseInt((track[2].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          const artist2 = parseInt((track[3].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));

          if(!recordingRelationshipsObject[track1]){
            recordingRelationshipsObject[track1] = {
              track1: track1,
              artist1: artist1,
              track2: track2,
              artist2: artist2
            };
          }
        }))
      }

      return;
    }));
    console.timeEnd("recording relationship");
    
    console.time("tracks");
    await Promise.all(Object.entries(recordingRelationshipsObject).map(async([key, { track2, artist2 }]) => {
      const result = await getArtistTracksFromRecording(track2, artist2);

      if(result){
        const track = result.split(",");

        const creditId = parseInt((track[0].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
        const credit = (track[1].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
        const id = parseInt((track[2].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
        const trackName = (track[3].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
        const recordingId = (track[4].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
        const releaseId = (track[5].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");

        if(!tracksObject[id]){
          tracksObject[id] = {
            id: id,
            trackName: trackName,
            releaseCredit: credit,
            releaseId: releaseId,
            creditId: creditId,
            recordingId: recordingId
          };

          return;
        }
  
        return;
      }
  
      return;
    }));
    console.timeEnd("tracks");
    
    console.time("artist_credit_name");
    await Promise.all(Object.entries(tracksObject).map(async([key, { creditId }]) => {
      if(!artistCreditNameObject[creditId]){
        const results = await getArtistCreditName(creditId);

        await Promise.all(Object.entries(results).map((result) => {
          const credit = result[1].split(",");
          const artistId = parseInt((credit[0].split(":")[1]).replace(/\s"{|}"+/g, ""));
          const creditId = parseInt((credit[1].split(":")[1]).replace(/\s"{|}"+/g, ""));

          if(!artistCreditNameObject[creditId]){
            artistCreditNameObject[creditId] = {
              creditId: creditId,
              artists: new Object()
            }
    
            artistCreditNameObject[creditId].artists[artistId] = {
              artistsId: artistId
            }
    
            return;
          }
    
          if(artistCreditNameObject[creditId]){
            if(!artistCreditNameObject[creditId].artists[artistId]){
              artistCreditNameObject[creditId].artists[artistId] = {
                artistsId: artistId
              }
            }
          }
    
          return;
        }));

        return;
      }
    }));
    console.timeEnd("artist_credit_name");
    
    console.time("Feature artistsInfo");
    await Promise.all(Object.entries(artistCreditNameObject).map(async([key, val]) => {
      await Promise.all(Object.entries(val.artists).map(async([key, { artistsId }]) => {
        const result = await getArtistInfo(artistsId)
        const artist = result.split(",");

        const id = parseInt((artist[0].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
        const stageName = (artist[1].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
        const comment = (artist[2].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
        const artistType = (artist[3].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
        const gender = (artist[4].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
        const area = (artist[5].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");

        if(!artistsObject[id]){
          artistsObject[id] = {
            id: id,
            stageName: stageName,
            comment: comment,
            type: artistType,
            gender: gender,
            origin: area,
            born: null
          }
          return;
        }
      }))
        
      return;
    }));
    console.timeEnd("Feature artistsInfo");
    
    console.time("artistRelationships");
    await Promise.all(Object.entries(artistsObject).map(async([key, { id }]) => {
      const results = await getArtistRelationships(id)

      if(results){
        await Promise.all(Object.entries(results).map((result) => {
          artist = result[1].split(",");
          
          const artist1 = parseInt((artist[0].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          const artist2 = parseInt((artist[1].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          
          if(!artistRelationshipsObject[artist1]){
            artistRelationshipsObject[artist1] = {
              artist1: artist1,
              artist2: artist2
            };
          }

          return;
        }));

        return;
      }

      return;
    }));
    console.timeEnd("artistRelationships");

    console.time("artistInfo");
    await Promise.all(Object.entries(artistRelationshipsObject).map(async([key, { artist2 }]) => {
      const result = await getArtistInfo(artist2)
      const artist = result.split(",");

      const id = parseInt((artist[0].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
      const stageName = (artist[1].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
      const comment = (artist[2].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
      const artistType = (artist[3].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
      const gender = (artist[4].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
      const area = (artist[5].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");

      if(!artistsObject[id]){
        artistsObject[id] = {
          id: id,
          stageName: stageName,
          comment: comment,
          type: artistType,
          gender: gender,
          origin: area,
          born: null
        }
        return;
      }

      return;
    }));
    console.timeEnd("artistInfo");

    console.time("artistLabelRelationships");
    await Promise.all(Object.entries(artistsObject).map(async([key,{ id }]) => {
      const results = await getArtistLabelRelationships(id)
      
      if(results){
        await Promise.all(Object.entries(results).map((result) => {
          const labelInfo = result[1].split(",");
          
          const artist = parseInt((labelInfo[0].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          const label = parseInt((labelInfo[1].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));

          if(!artistLabelRelationshipsObject[artist ]){
            artistLabelRelationshipsObject[artist ] = {
              artist: artist,
              label: label
            };
          }

          return;
        }))

        return;
      }

      return;
    }));
    console.timeEnd("artistLabelRelationships")
    
    // console.time("artistAlias");
    // await Promise.all(Object.entries(artistsObject).map(async([key, { id }]) => {
    //   const results = await getArtistAlias(id)

    //   await Promise.all(results.map((alias) => {
    //     if(!artistAliasObject[alias["Artist ID"]]){
    //       artistAliasObject[alias["Artist ID"]] = new Array();
    //     }
  
    //     artistAliasObject[alias["Artist ID"]].push(alias);
    //   }));

    //   return;
    // }));
    // console.timeEnd("artistAlias")

    // console.time("artistInfo");
    // await Promise.all(Object.entries(artistRelationshipsObject).map(async([key, { entity0, entity1}]) => {
    //   if(!artistsObject[entity0]){
    //     const results = await getArtistInfo(entity0);

    //     await Promise.all(results.map((artistInfo) => {
    //       if(!artistsObject[artistInfo["Artist ID"]]){
    //         artistsObject[artistInfo["Artist ID"]] = {
    //           id: artistInfo["Artist ID"],
    //           stageName: artistInfo["Stage Name"],
    //           origin: artistInfo["Origin"],
    //           type: artistInfo["Type"],
    //           born: artistInfo["Born"],
    //           gender: artistInfo["Gender"],
    //           comment: artistInfo["Comment"],
    //         }
    
    //         return;
    //       }
    
    //       return;
    //     }));
    //   }

    //   if(!artistsObject[entity1]){
    //     const results = await getArtistInfo(entity1);

    //     await Promise.all(results.map((artistInfo) => {
    //       if(!artistsObject[artistInfo["Artist ID"]]){
    //         artistsObject[artistInfo["Artist ID"]] = {
    //           id: artistInfo["Artist ID"],
    //           stageName: artistInfo["Stage Name"],
    //           origin: artistInfo["Origin"],
    //           type: artistInfo["Type"],
    //           born: artistInfo["Born"],
    //           gender: artistInfo["Gender"],
    //           comment: artistInfo["Comment"],
    //         }
    
    //         return;
    //       }
    
    //       return;
    //     }));
    //   }

    //   return;
    // }));
    // console.timeEnd("artistInfo");
    
    console.time("release");
    await Promise.all(Object.entries(tracksObject).map(async([key, { releaseId }]) => {
      if(!releasesObject[releaseId]){
        const result = await getReleasesById(releaseId);

        if(result){
          const releaseInfo = result.split(",");

          const creditId = parseInt((releaseInfo[0].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          const credit = (releaseInfo[1].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
          const id = parseInt((releaseInfo[2].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          const release = (releaseInfo[3].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
          const releaseType = (releaseInfo[4].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");

          if(!releasesObject[id]){
            releasesObject[id] = {
              id: id,
              release: release,
              releaseType: releaseType,
              releaseCredit: credit,
              creditId: creditId
            }

            return;
          }
    
          return;
        }

        return;
      }

      return;
    }));
    console.timeEnd("release");

    console.time("labels");
    await Promise.all(Object.entries(artistLabelRelationshipsObject).map(async([key, { label }]) => {
      if(!labelsObject[label]){
        const result = await getLabelInfo(label);

        if(result){
          const label = result.split(",");
          
          const id = parseInt((label[0].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          const name = (label[1].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
          let code = "";
          if(label[2]){
            code = parseInt((label[2].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          }
          let labelType = "";
          if(label[3]){
            labelType = (label[3].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
          }
          

          if(!labelsObject[id]){
            labelsObject[id] = {
              id: id,
              name: name,
              code: code,
              labelType: labelType
            }

            return;
          }
                
          return;
        }

        return;
      }
      
      return;
    }));
    console.timeEnd("labels");

    console.time("labels");
    await Promise.all(Object.entries(labelRelationshipsObject).map(async([key, { label2 }]) => {
      if(!labelsObject[label2]){
        const result = await getLabelInfo(label2);

        if(result){
          const label = result.split(",");
          
          const id = parseInt((label[0].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          const name = (label[1].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
          let code = "";
          if(label[2]){
            code = parseInt((label[2].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, ""));
          }
          let labelType = "";
          if(label[3]){
            labelType = (label[3].split(":")[1]).replace(/(^|\s)?[\{\}$"]?(^|\s)?/g, "");
          }
          

          if(!labelsObject[id]){
            labelsObject[id] = {
              id: id,
              name: name,
              code: code,
              labelType: labelType
            }

            return;
          }
                
          return;
        }
        
        return;
      }
      
      return;
    }));
    console.timeEnd("labels");

    console.log("Converting to objects...");

    console.log("Sending object");

    return res.send(JSON.stringify({
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
    redisClient.hget(`artists:${parseInt(artistId / 1000)}`, `${artistId}`, (err, res) => {
      if(err){
        reject(err);
      }

      resolve(res);
    })
  });
};

const getArtistCredits = (artistId) => {
  return new Promise(async(resolve, reject) => {
    redisClient.hgetall(`artist_credit_name_artist_credit:${artistId}`, (err, res) => {
      if(err){
        reject(err);
      }

      resolve(res);
    })
  })
}

const getArtistCreditName = (artistCreditId) => {
  return new Promise(async(resolve, reject) => {
    redisClient.hgetall(`artist_credit_artist_credit_name:${artistCreditId}`, (err, res) => {
      if(err){
        reject(err);
      }

      resolve(res);
    })
  });
}

const getReleases = (artistCreditId) => {
  return new Promise(async(resolve, reject) => {
    redisClient.hgetall(`releases:${artistCreditId}`, (err, res) => {
      if(err){
        reject(err);
      }

      resolve(res);
    })
  });
}; 

const getReleasesById = (releaseId) => {
  return new Promise(async(resolve, reject) => {
    redisClient.hget(`releases_id:${parseInt(releaseId / 1000)}`, `${releaseId}`, (err, res) => {
      if(err){
        reject(err);
      }

      resolve(res);
    })

    // let responseData = new Array();
    
    // const client = await pool.connect();
    // const getReleasesById = `
    //   SELECT DISTINCT artist_credit.id AS "Credit ID", artist_credit.name AS "Release Credit", release.id AS "Release ID", release.name AS "Release", release_group_primary_type.name AS "Type" FROM artist_credit
    //   RIGHT JOIN release
    //   ON artist_credit.id = release.artist_credit AND release.artist_credit != 1
    //   LEFT JOIN release_group
    //   ON release_group.id = release.release_group
    //   LEFT JOIN release_group_primary_type
    //   ON release_group_primary_type.id = release_group.type
    //   WHERE release.id = ${releaseId};   
    // `;
    
    // const query = new QueryStream(getReleasesById);
    // const stream = client.query(query);

    // stream.on('error', (error) => {
    //   console.log(error);
    //   reject(error);

    //   return client.release();
    // });

    // stream.on('data', (data) => {     
    //   responseData.push(data);

    //   // console.log("Release info added number of items: ", responseData.length);

    //   return;
    // });

    // stream.on('end', () => {
    //   // console.log("Release Info Query Complete")
    //   resolve(responseData);

    //   return client.release();
    // });


    // return stream.pipe(JSONStream.stringify());
  });
}; 

const getReleaseLabel = (releaseId) => {
  return new Promise(async(resolve, reject) => {
    redisClient.hgetall(`release_label:${releaseId}`, (err, res) => {
      if(err){
        reject(err);
      }

      resolve(res);
    })
  });
}

const getLabelInfo = (labelId) => {
  return new Promise(async(resolve, reject) => {
    redisClient.hget(`labels:${parseInt(labelId / 1000)}`, `${labelId}`, (err, res) => {
      if(err){
        reject(err);
      }

      resolve(res);
    })
  });
}

const getReleaseLabelInfo = (releaseId) => {
  return new Promise(async(resolve, reject) => {
    redisClient.hgetall(`release_label:${releaseId}`, (err, res) => {
      if(err){
        reject(err);
      }

      resolve(res);
    })
  });
};

const getArtistTracks = (artistCreditId) => {
  return new Promise(async(resolve, reject) => {
    redisClient.hgetall(`tracks:${artistCreditId}`, (err, res) => {
      if(err){
        reject(err);
      }

      resolve(res);
    })
  });
};

const getArtistTracksFromRecording = (track2, artist2) => {
  return new Promise(async(resolve, reject) => {
    redisClient.hget(`tracks:${artist2}`, track2, (err, res) => {
      if(err){
        reject(err);
      }

      resolve(res);
    })

    // let responseData = new Array();
    
    // const client = await pool.connect();
    // const getArtistTracksFromRecording = `
    //   SELECT DISTINCT artist_credit.id AS "Credit ID", artist_credit.name AS "Release Credit", track.id AS "Track ID", track.name AS "Track Name", track.recording AS "Recording ID", release.id AS "Release ID" FROM artist_credit
    //   RIGHT JOIN track
    //   ON track.artist_credit = artist_credit.id
    //   LEFT JOIN medium
    //   ON medium.id = track.medium
    //   LEFT JOIN release
    //   ON medium.release = release.id
    //   WHERE track.recording = ${recordingId};
    // `;

    // const query = new QueryStream(getArtistTracksFromRecording);
    // const stream = client.query(query);

    // stream.on('error', (error) => {
    //   console.log(error);
    //   reject(error);

    //   return client.release();
    // });

    // stream.on('data', (data) => {
    //   responseData.push(data);

    //   // console.log("Track added to response number of items: ", responseData.length);

    //   return;
    // });

    // stream.on('end', () => {
    //   // console.log("Tracks Query Complete");
    //   resolve(responseData);
      
    //   return client.release();
    // });


    // return stream.pipe(JSONStream.stringify());
  });
};

const getLabelRelationships = (labelId) => {
  return new Promise(async(resolve, reject) => {
    redisClient.hgetall(`label_label:${labelId}`, (err, res) => {
      if(err){
        reject(err);
      }
      
      resolve(res);
    })
    // let responseData = new Array();
    
    // const client = await pool.connect();
    // const getLabelRelationships = `
    //   SELECT * FROM (
    //     SELECT DISTINCT l_label_label.id, l_label_label.link, l_label_label.entity0, l_label_label.entity1, link_type.name, link_type.description
    //     FROM l_label_label
    //     LEFT JOIN link
    //     ON link.id = l_label_label.link
    //     LEFT JOIN link_type
    //     ON link_type.id = link.link_type
    //     WHERE l_label_label.entity0 = ${labelId}
    //     OR l_label_label.entity1 = ${labelId}
    //   ) AS "label_rel"
    //   WHERE label_rel.name = 'label ownership'
    //   OR label_rel.name = 'label rename'
    //   OR label_rel.name = 'imprint';
    // `;

    // const query = new QueryStream(getLabelRelationships);
    // const stream = client.query(query);

    // stream.on('error', (error) => {
    //   console.log(error);
    //   reject(error);

    //   return client.release();
    // });

    // stream.on('data', (data) => {
    //   responseData.push(data);

    //   // console.log("Track added to response number of items: ", responseData.length);

    //   return;
    // });

    // stream.on('end', () => {
    //   // console.log("Tracks Query Complete");
    //   resolve(responseData);
      
    //   return client.release();
    // });


    // return stream.pipe(JSONStream.stringify());
  });
}

const getRecordingRelationship = (id) => {
  return new Promise(async(resolve, reject) => {
    redisClient.hgetall(`recording_recording:${id}`, (err, res) => {
      if(err){
        reject(err);
      }
      
      resolve(res);
    })
    // let responseData = new Array();
    
    // const client = await pool.connect();
    // const getRecordingRelationship = `
    //   SELECT * FROM (
    //     SELECT DISTINCT l_recording_recording.id, l_recording_recording.link, l_recording_recording.entity0, l_recording_recording.entity1, link_type.name, link_type.description
    //     FROM l_recording_recording
    //     LEFT JOIN link
    //     ON link.id = l_recording_recording.link
    //     LEFT JOIN link_type
    //     ON link_type.id = link.link_type
    //     WHERE l_recording_recording.entity0 = ${track.id}
    //     OR l_recording_recording.entity1 = ${track.id}
    //     AND l_recording_recording.entity0 != l_recording_recording.entity1
    //   ) AS "recording_rel"
    //   WHERE recording_rel.name = 'samples material';
    // `;

    // const query = new QueryStream(getRecordingRelationship);
    // const stream = client.query(query);

    // stream.on('error', (error) => {
    //   console.log(error);
    //   reject(error);

    //   return client.release();
    // });

    // stream.on('data', (data) => {
    //   if(data.entity0 === track["Recording ID"]){
    //     data.entityNum = 1;
    //   }
    //   if(data.entity1 === track["Recording ID"]){
    //     data.entityNum = 0;
    //   }

    //   responseData.push(data);
    //   // console.log("Track added to response number of items: ", responseData.length);

    //   return;
    // });

    // stream.on('end', () => {
    //   // console.log("Tracks Query Complete");
    //   resolve(responseData);
      
    //   return client.release();
    // });


    // return stream.pipe(JSONStream.stringify());
  });
}

const getArtistRelationships = (artistId) => {
  return new Promise(async(resolve, reject) => {
    redisClient.hgetall(`artist_artist:${artistId}`, (err, res) => {
      if(err){
        reject(err);
      }
      
      resolve(res);
    })
    // let responseData = new Array();
    
    // const client = await pool.connect();
    // const getArtistRelationships = `
    //   select * FROM (
    //     SELECT DISTINCT l_artist_artist.id, l_artist_artist.link, l_artist_artist.entity0, l_artist_artist.entity1, link_type.name, link_type.description
    //     FROM l_artist_artist
    //     LEFT JOIN link
    //     ON link.id = l_artist_artist.link
    //     LEFT JOIN link_type
    //     ON link_type.id = link.link_type 
    //     WHERE l_artist_artist.entity0 = ${artistId} 
    //     OR l_artist_artist.entity1 = ${artistId}
    //   ) AS artist_rel
    //   WHERE artist_rel.name = 'member of band'
    //   OR artist_rel.name = 'parent'
    //   OR artist_rel.name = 'sibling'
    //   OR artist_rel.name = 'married'
    //   OR artist_rel.name = 'subgroup'
    //   OR artist_rel.name = 'tribute';
    // `;

    // const query = new QueryStream(getArtistRelationships);
    // const stream = client.query(query);

    // stream.on('error', (error) => {
    //   console.log(error);
    //   reject(error);

    //   return client.release();
    // });

    // stream.on('data', (data) => {
    //   responseData.push(data);

    //   // console.log("Track added to response number of items: ", responseData.length);

    //   return;
    // });

    // stream.on('end', () => {
    //   // console.log("Tracks Query Complete");
    //   resolve(responseData);
      
    //   return client.release();
    // });


    // return stream.pipe(JSONStream.stringify());
  });
}

const getArtistLabelRelationships = (artistId) => {
  return new Promise(async(resolve, reject) => {
    redisClient.hgetall(`artist_label:${artistId}`, (err, res) => {
      if(err){
        reject(err);
      }
      
      resolve(res);
    })
    // let responseData = new Array();
    
    // const client = await pool.connect();
    // const getArtistLabelRelationships = `
    //   SELECT * FROM (
    //     SELECT DISTINCT l_artist_label.id, l_artist_label.link, l_artist_label.entity0, l_artist_label.entity1, link_type.name, link_type.description 
    //     FROM l_artist_label
    //     LEFT JOIN link
    //     ON link.id = l_artist_label.link
    //     LEFT JOIN link_type
    //     ON link_type.id = link.link_type
    //     WHERE l_artist_label.entity0 = ${artistId}
    //   ) AS "artist_label_rel"
    //   WHERE artist_label_rel.name = 'recording contract'
    //   OR artist_label_rel.name = 'label founder'
    //   OR artist_label_rel.name = 'owner'
    //   OR artist_label_rel.name = 'personal label'
    // `;

    // const query = new QueryStream(getArtistLabelRelationships);
    // const stream = client.query(query);

    // stream.on('error', (error) => {
    //   console.log(error);
    //   reject(error);

    //   return client.release();
    // });

    // stream.on('data', (data) => {
    //   responseData.push(data);

    //   // console.log("Track added to response number of items: ", responseData.length);

    //   return;
    // });

    // stream.on('end', () => {
    //   // console.log("Tracks Query Complete");
    //   resolve(responseData);
      
    //   return client.release();
    // });


    // return stream.pipe(JSONStream.stringify());
  });
}
