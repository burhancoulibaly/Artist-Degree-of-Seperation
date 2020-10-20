#!/bin/bash
read -p "Enter the name of the new page: " PAGE;

touch "${PWD}/frontend/css/${PAGE}.css";
touch "${PWD}/frontend/html/${PAGE}.html";
touch "${PWD}/frontend/js/${PAGE}.js";

HTMLSCRIPT='<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>'${PAGE}'</title>
  <script type="text/javascript" src="/jquery/dist/jquery.js"></script>
  <link rel="stylesheet" href="/bootstrap/css/bootstrap.css">
  <link rel="stylesheet" href="/css/'${PAGE}'.css">
</head>
<body>
  <script src="jquery/dist/jquery.js"></script>
  <script src="js/'${PAGE}'.js"></script>
</body>
</html>'

ROUTE='app.get("/'${PAGE}'", function(req,res){
  res.sendFile(html+"/'${PAGE}'.html");
});'

echo "${HTMLSCRIPT}" >> "${PWD}/frontend/html/${PAGE}.html";
echo "${ROUTE}" >> "${PWD}/backend/server.js";
