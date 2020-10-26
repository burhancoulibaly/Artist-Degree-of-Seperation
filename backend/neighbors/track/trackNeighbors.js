const QueryStream = require('pg-query-stream'),
      JSONStream = require('JSONStream');

const getTrackNeighbors = (pool, track) => {
    return new Promise(async(resolve, reject) => {
        try {
            const artistAliasObject = new Object();
            const artistsObject = new Object();
            const artistCreditsObject = new Object();
            const artistCreditNameObject = new Object();
            const releasesObject = new Object();
            const tracksObject = new Object();
            const recordingRelationshipsObject = new Object();
            const artistRelationshipsObject = new Object();
            const artistLabelRelationshipsObject = new Object();
            const labelsObject = new Object();

            tracksObject[track.id] = {
                id: track.id,
                trackName: track.trackName,
                releaseCredit: track.releaseCredit,
                releaseId: track.releaseId,
                creditId: track.creditId,
                recordingId: track.recordingId,
                type: "track"
            };

            console.time("release");
            await Promise.all(Object.entries(tracksObject).map(async([key, { releaseId }]) => {
                if(!releasesObject[releaseId]){
                    const results = await getReleasesById(pool, releaseId)

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
                        }

                        return;
                    }));
                }

                return;
            }));
            console.timeEnd("release");

            console.time("artist_credit_name");
            await Promise.all(Object.entries(tracksObject).map(async([key, { creditId }]) => {
                if(!artistCreditNameObject[creditId]){
                    const results = await getArtistCreditName(pool, creditId)

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

            console.time("recording relationship");
            await Promise.all(Object.entries(tracksObject).map(async([key, val]) => {
                const results = await getRecordingRelationship(pool, val)

                await Promise.all(results.map((result) => {
                    if(!recordingRelationshipsObject[result.id]){
                        recordingRelationshipsObject[result.id] = result;
                    }
                }))

                return;
            }));
            console.timeEnd("recording relationship");

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
                    
                        return;
                    }));
                }))
                    
                return;
            }));
            console.timeEnd("Feature artistsInfo");

            console.time("tracks");
            await Promise.all(Object.entries(recordingRelationshipsObject).map(async([key, { entityNum, entity0, entity1}]) => {
                if(entityNum === 0){
                    const results = await getArtistTracksFromRecording(pool, entity0);

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
                        }
                
                        return;
                    }));

                    return;
                }

                if(entityNum === 1){
                    const results = await getArtistTracksFromRecording(pool, entity1);

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
                        }
                    
                        return;
                    }));

                    return;
                }

                return;
            }));
            console.timeEnd("tracks");

            resolve(JSON.stringify({
                artists: artistsObject,
                releases: releasesObject,
                tracks: tracksObject,
            }))
        } catch (error) {
            console.log(error);
            reject(new Error(error));
        }
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

const getArtistTracksFromRecording = (pool, recordingId) => {
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

const getRecordingRelationship = (pool, track) => {
    return new Promise(async(resolve, reject) => {
        let responseData = new Array();
        
        const client = await pool.connect();
        const getRecordingRelationship = `
            SELECT * FROM (
                SELECT DISTINCT l_recording_recording.id, l_recording_recording.link, l_recording_recording.entity0, l_recording_recording.entity1, link_type.name, link_type.description,
                (
                    SELECT DISTINCT recording.name AS "recording1" FROM recording
                    WHERE l_recording_recording.entity0 = recording.id
                    ) AS "recording1",
                (
                    SELECT DISTINCT recording.name AS "recording2" FROM recording
                    WHERE l_recording_recording.entity1 = recording.id
                    ) AS "recording2"
                FROM l_recording_recording
                LEFT JOIN link
                ON link.id = l_recording_recording.link
                LEFT JOIN link_type
                ON link_type.id = link.link_type
                WHERE l_recording_recording.entity0 = ${track.recordingId}
                OR l_recording_recording.entity1 = ${track.recordingId}
                AND l_recording_recording.entity0 != l_recording_recording.entity1
            ) AS "recording_rel"
            WHERE recording_rel.name = 'samples material'
            OR recording_rel.name = 'remix';
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

module.exports = {
    getTrackNeighbors
}