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
  user: 'musicbrainz',
  host: '127.0.0.1',
  database: 'musicbrainz',
  password: 'Burbur69',
  port: 5432,
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
    const artistCreditNameObject = new Object();
    const releasesObject = new Object();
    const tracksObject = new Object();
    const labelReleaseObject = new Object();
    const labelsObject = new Object();

  try {
    let artistsInfo = new Array();
    let artistAlias = new Array();
    let artistCredits = new Array();
    let artistCreditName = new Array();
    let tracks = new Array();
    let releases = new Array();
    let releaseLabel = new Array();
    let labels = new Array();

    console.time("artistAlias");
    await Promise.all(artists.map(async(artistId) => {
      const results = await getArtistAlias(artistId)

      artistAlias.push(...results);

      return;
    }));
    console.timeEnd("artistAlias")

    console.time("artistsInfo");
    await Promise.all(artists.map(async(artistId) => {
      const results = await getArtistInfo(artistId)

      artistsInfo.push(...results);

      return;
    }));
    console.timeEnd("artistsInfo");

    console.time("artistCredits");
    await Promise.all(artists.map(async(artistId) => {
      const results = await getArtistCredits(artistId);

      artistCredits.push(...results);

      return;
    }));
    console.timeEnd("artistCredits");

    console.time("artist_credit_name");
    await Promise.all(artistCredits.map(async(artistCredit) => {
      const results = await getArtistCreditName(artistCredit.id)

      artistCreditName.push(...results);

      return;
    }));
    console.timeEnd("artist_credit_name");
    
    console.time("releases");
    await Promise.all(artistCredits.map(async(artistCredit) => {
      const results = await getReleases(artistCredit.id);

      releases.push(...results);

      return;
    }));
    console.timeEnd("releases");

    console.time("release_label");
    await Promise.all(releases.map(async(release) => {
      const results = await getReleaseLabel(release["Release ID"]);

      releaseLabel.push(...results);

      return;
    }));
    console.timeEnd("release_label");

    console.time("tracks");
    await Promise.all(releases.map(async(release) => {
      const results = await getArtistTracks(release["Release ID"]);

      tracks.push(...results);

      return;
    }));
    console.timeEnd("tracks");

    console.time("labels");
    await Promise.all(releases.map(async(release) => {
      const results = await getReleaseLabelInfo(release["Release ID"]);

      labels.push(...results);

      return;
    }));
    console.timeEnd("labels");

    console.time("artist_credit_name");
    await Promise.all(tracks.map(async(track) => {
      const results = await getArtistCreditName(track["Credit ID"])

      artistCreditName.push(...results);

      return;
    }));
    console.timeEnd("artist_credit_name");

    console.time("artist_credit_name");
    await Promise.all(artistCredits.map(async(artistCredit) => {
      const results = await getArtistCreditName(artistCredit.id)

      artistCreditName.push(...results);

      return;
    }));
    console.timeEnd("artist_credit_name");

    console.time("Feature artistsInfo");
    await Promise.all(artistCreditName.map(async(credit) => {
      // if(credit["Artist ID"] !== artists[0] && credit["Artist ID"] !== artists[1]){
        const results = await getArtistInfo(credit["Artist ID"])

        artistsInfo.push(...results);
          
        return;
      // }
      
      return;
    }));
    console.timeEnd("Feature artistsInfo");

    console.time("artistAlias");
    await Promise.all(artistsInfo.map(async(artistInfo) => {
      // if(artistInfo["Artist ID"] !== artists[0] && artistInfo["Artist ID"] !== artists[1]){
        const results = await getArtistAlias(artistInfo["Artist ID"])

        artistAlias.push(...results);

        return;
      // }
      
      return;
    }));
    console.timeEnd("artistAlias")

    

    await Promise.all(artistAlias.map((alias) => {
      if(!artistAliasObject[alias["Artist ID"]]){
        artistAliasObject[alias["Artist ID"]] = new Array();
      }

      artistAliasObject[alias["Artist ID"]].push(alias);
    }));

    await Promise.all(artistsInfo.map((artistInfo) => {
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

    await Promise.all(artistCreditName.map((credit) => {
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

    await Promise.all(releases.map((release) => {
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

    await Promise.all(tracks.map((track) => {
      if(!tracksObject[track["Track ID"]]){
        tracksObject[track["Track ID"]] = {
          "Track ID": track["Track ID"],
          "Track Name": track["Track Name"],
          "Release Credit": track["Release Credit"],
          "Release ID": track["Release ID"],
          "Credit ID": track["Credit ID"]
        };

        return;
      }

      return;
    }));

    await Promise.all(releaseLabel.map((relation) => {
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

    await Promise.all(labels.map((label) => {
      if(!labelsObject[label["Label ID"]]){
        labelsObject[label["Label ID"]] = label;
        
        return;
      }

      return;
    }));

    console.log("Converting to objects...");

    console.log("Sending object");

    return res.send(JSON.stringify({
      artistAlias: artistAliasObject,
      artists: artistsObject,
      artistCreditName: artistCreditNameObject,
      releases: releasesObject,
      tracks: tracksObject ,
      releaseLabel: labelReleaseObject,
      labels: labelsObject
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
      SELECT DISTINCT artist_credit.id AS "Credit ID", artist_credit.name AS "Release Credit", track.id AS "Track ID", track.name AS "Track Name", release.id AS "Release ID" FROM artist_credit
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
