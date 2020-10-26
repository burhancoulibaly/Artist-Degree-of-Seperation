const QueryStream = require('pg-query-stream'),
      JSONStream = require('JSONStream');

const getArtistNeighbors = (pool, artistInfo) => {
    return new Promise(async(resolve, reject) => {
        try {
            const artistCredits = new Array();
            const artistAliasObject = new Object();
            const artistsObject = new Object();
            const artistCreditsObject = new Object();
            const artistCreditNameObject = new Object();
            const releasesObject = new Object();
            const tracksObject = new Object();
            const artistRelationshipsObject = new Object();
            const artistLabelRelationshipsObject = new Object();
            const labelsObject = new Object();
            // const labelReleaseObject = new Object();

            if(!artistsObject[artistInfo.id]){
                artistsObject[artistInfo.id] = {
                    id: artistInfo.id,
                    stageName: artistInfo.stageName,
                    origin: artistInfo.origin,
                    artistType: artistInfo.type,
                    born: artistInfo.born,
                    gender: artistInfo.gender,
                    comment: artistInfo.comment,
                    type: "artist"
                }
            }
            
            await Promise.all(Object.entries(artistsObject).map(async([key, { id }]) => {
                const results = await getArtistCredits(pool, id);

                artistCredits.push(...results);
            }));
            
            Promise.all(artistCredits.map((artistCredit) => {
                if(!artistCreditsObject[artistCredit.id]){
                    artistCreditsObject[artistCredit.id] = {
                        id: artistCredit.id
                    }
                }
            }));

            console.time("releases");
            await Promise.all(Object.entries(artistCreditsObject).map(async([key, { id }]) => {
                const results = await getReleases(pool, id);
    
                await Promise.all(results.map((release) => {
                    if(!releasesObject[release["Release ID"]]){
                        releasesObject[release["Release ID"]] = {
                            id: release["Release ID"],
                            release: release["Release"],
                            releaseType: release["Type"],
                            releaseCredit: release["Release Credit"],
                            creditId: release["Credit ID"],
                            type: "release"
                        }
    
                        return;
                    }
    
                    return;
                }));
    
                return;
            }));
            console.timeEnd("releases");
    
            console.time("tracks");
            await Promise.all(Object.entries(releasesObject).map(async([key, { id }]) => {
                const results = await getArtistTracks(pool, id);
    
                await Promise.all(results.map((track) => {
                    if(!tracksObject[track["Track ID"]]){
                        tracksObject[track["Track ID"]] = {
                            id: track["Track ID"],
                            trackName: track["Track Name"],
                            releaseCredit: track["Release Credit"],
                            releaseId: track["Release ID"],
                            creditId: track["Credit ID"],
                            recordingId: track["Recording ID"],
                            type: "track"
                        };
    
                        return;
                    }
    
                    return;
                }));
    
                return;
            }));
            console.timeEnd("tracks");
    
            console.time("artistRelationships");
            await Promise.all(Object.entries(artistsObject).map(async([key, { id }]) => {
                const results = await getArtistRelationships(pool, id)
    
                await Promise.all(results.map((result) => {
                    if(!artistRelationshipsObject[result.id]){
                        artistRelationshipsObject[result.id] = result;
                    }
                }))
    
                return;
            }));
            console.timeEnd("artistRelationships")
    
            console.time("artistInfo");
            await Promise.all(Object.entries(artistRelationshipsObject).map(async([key, { entity0, entity1}]) => {
                if(!artistsObject[entity0]){
                    const results = await getArtistInfo(pool, entity0);
    
                    await Promise.all(results.map((artistInfo) => {
                        if(!artistsObject[artistInfo["Artist ID"]]){
                            artistsObject[artistInfo["Artist ID"]] = {
                                id: artistInfo["Artist ID"],
                                stageName: artistInfo["Stage Name"],
                                origin: artistInfo["Origin"],
                                artistType: artistInfo["Type"],
                                born: artistInfo["Born"],
                                gender: artistInfo["Gender"],
                                comment: artistInfo["Comment"],
                                type: "artist"
                            }
    
                            return;
                        }
    
                        return;
                    }));
                }
    
                if(!artistsObject[entity1]){
                    const results = await getArtistInfo(pool, entity1);
    
                    await Promise.all(results.map((artistInfo) => {
                        if(!artistsObject[artistInfo["Artist ID"]]){
                            artistsObject[artistInfo["Artist ID"]] = {
                                id: artistInfo["Artist ID"],
                                stageName: artistInfo["Stage Name"],
                                origin: artistInfo["Origin"],
                                artistType: artistInfo["Type"],
                                born: artistInfo["Born"],
                                gender: artistInfo["Gender"],
                                comment: artistInfo["Comment"],
                                type: "artist"
                            }
    
                            return;
                        }
    
                        return;
                    }));
                }
    
                return;
            }));
            console.timeEnd("artistInfo");
    
            console.time("artistLabelRelationships");
            await Promise.all(Object.entries(artistsObject).map(async([key, { id }]) => {
                const results = await getArtistLabelRelationships(pool, id)
    
                await Promise.all(results.map((result) => {
                    if(!artistLabelRelationshipsObject[result.id]){
                        artistLabelRelationshipsObject[result.id] = result;
                    }
                }))
    
                return;
            }));
            console.timeEnd("artistLabelRelationships");
    
            console.time("labels");
            await Promise.all(Object.entries(artistLabelRelationshipsObject).map(async([key, { entity1 }]) => {
                if(!labelsObject[entity1]){
                    const results = await getLabelInfo(pool, entity1);
                    
                    await Promise.all(results.map((label) => {
                        if(!labelsObject[label["Label ID"]]){
                            labelsObject[label["Label ID"]] = {
                                id: label["Label ID"],
                                name: label["Label Name"],
                                code: label["Label Code"],
                                labelType: label["Label Type"],
                                type: "label"
                            };
                            
                            return;
                        }
    
                        return;
                    }));
                }
                
                return;
            }));
            console.timeEnd("labels");
    
            console.time("artistAlias");
            await Promise.all(Object.entries(artistsObject).map(async([key, { id }]) => {
                const results = await getArtistAlias(pool, id)
    
                await Promise.all(results.map((alias) => {
                    if(!artistAliasObject[alias["Artist ID"]]){
                        artistAliasObject[alias["Artist ID"]] = new Array();
                    }
    
                    artistAliasObject[alias["Artist ID"]].push(alias);
                }));
    
                return;
            }));
            console.timeEnd("artistAlias")
    
            return resolve(JSON.stringify({
                artistAlias: artistAliasObject,
                artists: artistsObject,
                // artistCreditName: artistCreditNameObject,
                // releases: releasesObject,
                // tracks: tracksObject,
                // artistRelationships: artistRelationshipsObject,
                // artistLabelRelationships: artistLabelRelationshipsObject,
                labels: labelsObject
            }));
        } catch (error) {
            console.log(error)
            reject(new Error(error));
        }
    }) 
}

const getArtistAlias = (pool, artistId) => {
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

const getArtistInfo = (pool, artistId) => {
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

  const getArtistCreditName = (pool, artistCreditId) => {
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


const getArtistTracks = (pool, releaseId) => {
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

const getReleases = (pool, artistCreditId) => {
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

const getArtistCredits = (pool, artistId) => {
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

const getArtistRelationships = (pool, artistId) => {
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

const getArtistLabelRelationships = (pool, artistId) => {
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

const getLabelInfo = (pool, labelId) => {
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

module.exports = {
    getArtistNeighbors
}