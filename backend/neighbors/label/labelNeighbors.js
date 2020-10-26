const QueryStream = require('pg-query-stream'),
      JSONStream = require('JSONStream');

const getLabelNeighbors = (pool, label) => {
    return new Promise(async(resolve, reject) => {
        try {
            const artistAliasObject = new Object();
            const artistsObject = new Object();
            const artistCreditsObject = new Object();
            const artistCreditNameObject = new Object();
            const releasesObject = new Object();
            const tracksObject = new Object();
            const artistRelationshipsObject = new Object();
            const artistLabelRelationshipsObject = new Object();
            const labelReleaseObject = new Object();
            const labelRelationshipsObject = new Object(); 
            const labelsObject = new Object();

            labelsObject[label.id] = {
                id: label.id,
                name: label.name,
                code: label.code,
                labelType: label.labelType,
                type: "label"
            };

            // console.time("release_label");
            // await Promise.all(Object.entries(labelsObject).map(async([key, { id }]) => {
            //     const results = await getReleaseLabel(pool, id);

            //     await Promise.all(results.map((relation) => {
            //         if(!labelReleaseObject[relation["Release ID"]]){
            //             labelReleaseObject[relation["Release ID"]] = {
            //                 releaseId: relation["Release ID"],
            //                 labels: new Object()
            //             }

            //             labelReleaseObject[relation["Release ID"]].labels[relation["Label ID"]] = {
            //                 labelId: relation["Label ID"]
            //             }

            //             return;
            //         }

            //         if(labelReleaseObject[relation["Release ID"]]){
            //             if(!labelReleaseObject[relation["Release ID"]].labels[relation["Label ID"]]){
            //                 labelReleaseObject[relation["Release ID"]].labels[relation["Label ID"]] = {
            //                     labelId: relation["Label ID"]
            //                 }
            //             }
            //         }

            //         return;
            //     }));

            //     return;
            // }));
            // console.timeEnd("release_label");

            // console.time("release");
            // await Promise.all(Object.entries(labelReleaseObject).map(async([key, val]) => {
            //     if(!releasesObject[val.releaseId]){
            //         const results = await getReleasesById(pool, val.releaseId)

            //         await Promise.all(results.map((release) => {
            //             if(!releasesObject[release["Release ID"]]){
            //                 releasesObject[release["Release ID"]] = {
            //                     id: release["Release ID"],
            //                     release: release["Release"],
            //                     releaseType: release["Type"],
            //                     releaseCredit: release["Release Credit"],
            //                     creditId: release["Credit ID"],
            //                     type: "release"
            //                 }
            //             }

            //             return;
            //         }));
            //     }

            //     return;
            // }))
            // console.timeEnd("release");

            console.time("artistLabelRelationships");
            await Promise.all(Object.entries(labelsObject).map(async([key, { id }]) => {
                const results = await getArtistLabelRelationships(pool, id)
            
                await Promise.all(results.map((result) => {
                    if(!artistLabelRelationshipsObject[result.id]){
                        artistLabelRelationshipsObject[result.id] = result;
                    }
                }))
            
                return;
            }));
            console.timeEnd("artistLabelRelationships");

            console.time("labelRelationships");
            await Promise.all(Object.entries(labelsObject).map(async([key, { id }]) => {
                const results = await getLabelRelationships(pool, id);

                await Promise.all(results.map((result) => {
                    if(!labelRelationshipsObject[result.id]){
                        labelRelationshipsObject[result.id] = result;
                    }
                }))

                return;
            }));
            console.timeEnd("labelRelationships");

            console.time("labels");
            await Promise.all(Object.entries(artistLabelRelationshipsObject).map(async([key, { entity0 }]) => {
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
                    const results = await getLabelInfo(pool, entity0);

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

            return resolve(JSON.stringify({
                artists: artistsObject,
                // releases: releasesObject,
                labels: labelsObject
            }));
        } catch (error) {
            console.log(error);
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

  const getReleasesById = (pool, releaseId) => {
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
      
      
      
      const getLabelRelationships = (pool, labelId) => {
        return new Promise(async(resolve, reject) => {
          let responseData = new Array();
          
          const client = await pool.connect();
          const getLabelRelationships = `
            SELECT * FROM (
              SELECT DISTINCT l_label_label.id, l_label_label.link, l_label_label.entity0, l_label_label.entity1, link_type.name, link_type.description,
              (
                SELECT DISTINCT label.name AS "label1" FROM label
                WHERE l_label_label.entity0 = label.id
              ) AS "label1",
              (
                SELECT DISTINCT label.name AS "label2" FROM label
                WHERE l_label_label.entity1 = label.id
              ) AS "label2"
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

      const getArtistLabelRelationships = (pool, labelId) => {
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
            WHERE l_artist_label.entity1 = ${labelId}
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

    const getReleaseLabel = (pool, labelId) => {
        return new Promise(async(resolve, reject) => {
          let responseData = new Array();
          
          const client = await pool.connect();
          const getReleaseLabel = `
            SELECT release_label.release AS "Release ID", release_label.label AS "Label ID" FROM release_label
            WHERE release_label.label = ${labelId};
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


module.exports = {
    getLabelNeighbors
}