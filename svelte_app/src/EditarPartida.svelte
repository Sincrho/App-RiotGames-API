<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js">
  const apiURL = "http://127.0.0.1:5000/get_partida/";
  const apiURL2 = "http://127.0.0.1:5000/update_partida/";

  let dataPartida =[];
  let resultadoPartidaNuevo = "";


  import { onMount } from "svelte";
  export let params
    
  let idPartida = params.ID_Partida
    
  onMount(async function() {
         const response = await fetch(apiURL+idPartida);
         let json  = await response.json();
         dataPartida = json;
         console.log(dataPartida)
    }); 
  
  async function actualizarPartida() {
    if(resultadoPartidaNuevo =="")
      resultadoPartidaNuevo = dataPartida.resultado_partida
    const response= await fetch(apiURL2+idPartida,{
            method: 'PUT', 
            headers: {'Content-Type' : 'application/json'},
            body:JSON.stringify({
              "id_partida": null,
              "resultado_partida": resultadoPartidaNuevo
            })
        });
    const json = await response.json()
    let result = JSON.stringify(json)
    console.log(result)
    location.href = "/#/Torneos";
  }  
</script>
            
<svelte:head>
    <!--Import Google Icon Font-->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <!--Import materialize.css-->
    <link type="text/css" rel="stylesheet" href="css/materialize.min.css"  media="screen,projection"/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
    <!--Let browser know website is optimized for mobile -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</svelte:head>

<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)" >
  <div class="container " style ="padding-top: 10%">
    <div class = "container">
      <div class="col s12 m4 l8 card blue-grey lighten-5">
        <div class="card-content black-text thick " >
          <span class="card-title center " style = "color: #263238 ;font-size: 2em;font-weight: bolder;">Editar Partida</span>
        <span class="card-title center " style = "color: #263238 ;font-size: 1em;font-weight: bolder;">Editando partida #{dataPartida.id_partida}</span>
        </div>
        <div class="card-action">
          <div class ="container">
            <div class="row input-field col s6 offset ">
            <input style="border-radius: 20px" bind:value={resultadoPartidaNuevo} placeholder={dataPartida.resultado_partida} id="first_name" type="text" class="white validate black-text">
              <label  class="active " for="first_name ">Resultado Partida</label>
            </div>
          </div>
          <div class = "container">    
              <button  class ="waves-effect waves-light btn   blue darken-1" on:click={()=> actualizarPartida()}><i class="material-icons left ">check_circle</i>Confirmar</button>
          </div>    
        </div>
      </div>
    </div>
  </div>
</body>

  