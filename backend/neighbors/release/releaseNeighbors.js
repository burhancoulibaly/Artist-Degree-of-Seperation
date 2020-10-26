const QueryStream = require('pg-query-stream'),
      JSONStream = require('JSONStream');

const getReleaseNeighbors = (pool, release) => {
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
            const labelsObject = new Object();

            releasesObject[release.id] = {
                id: release.id,
                release: release.release,
                releaseType: release.releaseType,
                releaseCredit: release.releaseCredit,
                creditId: release.creditId,
                type: "release"
            }
            
            console.time("artist_credit_name");
            await Promise.all(Object.entries(releasesObject).map(async([key, { creditId }]) => {
                if(!artistCreditNameObject[creditId]){
                    const results = await getArtistCreditName(pool, creditId);

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
                    const results = await getArtistInfo(pool, artistsId)

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
                    }));
                    return;
                }));
                
                return;
            }));
            console.timeEnd("Feature artistsInfo");

            // console.time("tracks");
            // await Promise.all(Object.entries(releasesObject).map(async([key, { id }]) => {
            //     const results = await getArtistTracks(pool, id);

            //     await Promise.all(results.map((track) => {
            //         if(!tracksObject[track["Track ID"]]){
            //             tracksObject[track["Track ID"]] = {
            //                 id: track["Track ID"],
            //                 trackName: track["Track Name"],
            //                 releaseCredit: track["Release Credit"],
            //                 releaseId: track["Release ID"],
            //                 creditId: track["Credit ID"],
            //                 recordingId: track["Recording ID"],
            //                 type: "track"
            //             }
            //         }

            //         return;
            //     }));

            //     return;
            // }));
            // console.timeEnd("tracks");

            console.time("labels");
            await Promise.all(Object.entries(releasesObject).map(async([key, { id }]) => {
                const results = await getReleaseLabelInfo(pool, id);

                await Promise.all(results.map((label) => {
                    if(!labelsObject[label["Label ID"]]){
                        labelsObject[label["Label ID"]] = {
                            id: label["Label ID"],
                            name: label["Label Name"],
                            code: label["Label Code"],
                            labelType: label["Label Type"],
                            type: "label"
                        };
                    }

                    return;
                }));

                return;
            }));
            console.timeEnd("labels");

            // console.time("release_label");
            // await Promise.all(Object.entries(releasesObject).map(async([key, { id }]) => {
            //     const results = await getReleaseLabel(id);

            //     await Promise.all(results.map((relation) => {
            //         if(!labelReleasesObject[relation["Release ID"]]){
            //             labelReleasesObject[relation["Release ID"]] = {
            //                 releaseId: relation["Release ID"],
            //                 labels: new Object()
            //             }

            //             labelReleasesObject[relation["Release ID"]].labels[relation["Label ID"]] = {
            //                 labelId: relation["Label ID"]
            //             }

            //             return;
            //         }

            //         if(labelReleasesObject[relation["Release ID"]]){
            //             if(!labelReleasesObject[relation["Release ID"]].labels[relation["Label ID"]]){
            //                 labelReleasesObject[relation["Release ID"]].labels[relation["Label ID"]] = {
            //                     labelId: relation["Label ID"]
            //                 }
            //             }
            //         }

            //         return;
            //     }));

            //     return;
            // }));
            // console.timeEnd("release_label");

            resolve(JSON.stringify({
                artists: artistsObject,
                // tracks: tracksObject,
                labels: labelsObject
            }))
        } catch (error) {
            console.log(error)
            reject(new Error(error));
        }
    })
}  

const getReleaseLabelInfo = (pool, releaseId) => {
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

module.exports = {
    getReleaseNeighbors
}