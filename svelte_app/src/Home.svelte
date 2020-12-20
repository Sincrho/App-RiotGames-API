<svelte:head>
  <style>
	#text_alignh2 {
		position: absolute;
		top: 350%;/*250*/
		left: 36%;/*36*/
		text-shadow: 0 0 3px #FF0000, 0 0 5px #0000FF;
	}
	#h5estilo_id {
		position: absolute;
		top: 430%;
		left: 6%;
		text-shadow: 0 0 3px #FF0000, 0 0 5px #0000FF;
		text-align:center;
	}      
	#hero{
		background-image: url('https://cdn.vox-cdn.com/thumbor/Oxry2s55xo7kmUYy9ILLcFREUas=/0x0:2000x1125/1200x800/filters:focal(840x403:1160x723)/cdn.vox-cdn.com/uploads/chorus_image/image/67145067/pudong_stadium_league_of_legends.0.png');
		background-size: cover;
		width: 100%;
		height: 100%;
		padding-top: 90 px ;
		min-height: 700 px;
		color: #ffffff;
	}
	
	div.container4 {
    height: 10em;
    position: relative; 
	}
	div.container4 h1{
    	margin: 0;
		font-weight: bold;
		color:white;
		font-size: 4em;
    	position: absolute;
    	top: 20%;
    	left: 40%;
    	margin-right: -50%;
    	transform: translate(-20%, -20%);
		text-shadow: 0 0 3px #FF0000, 0 0 5px #0000FF; 
	}
	
	div.container4 p{
    margin: 0;
	font-weight: bold !IMPORTANT;
	color:white;
	font-size: 2em;
    position: absolute;
    top: 100%;
    left: 38%;
    margin-right: -50%;
    transform: translate(-20%, -20%);
	text-shadow: 0 0 3px #FF0000, 0 0 5px #0000FF;
	}
</style>

</svelte:head>


<body id ="hero">
        <div class="container4">
            <div class="content-center ">
                <h1>Tournament Manager</h1>
                <p>Organiza tus torneos de una forma mas simple y rapida</p>
				<h2 id="text_alignh2">¿QUIENES SOMOS?</h2>
				<h5 id="h5estilo_id"> SOMOS UN GRUPO DE ESTUDIANTES DE LA UNIVERSIDAD BLAS PASCAL, QUE TRATAN DE RESOLVER LA PROBLEMATICA DE ALGUNAS ORGANIZACIONES A LA HORA DE ORGANIZAR UN TORNEO DE LEAGUE OF LEGENDS</h5>
            </div>
        </div>
</body>


