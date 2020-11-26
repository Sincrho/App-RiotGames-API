<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js">
  const apiURL = "http://127.0.0.1:5000/get_jugador/";
  const apiURL2 = "http://127.0.0.1:5000/get_servidores";
  const apiURL3 = "http://127.0.0.1:5000/update_jugador/";
  const apiURL4 = "http://127.0.0.1:5000/delete_jugador/"
  const apiURLx = "http://127.0.0.1:5000/add_jugador"
  let data =[];
  let selected;

  let dataServidores = [];
  let nombreJugadorNuevo = "prueba312313";
  import { onMount } from "svelte";
  export let params
  let idJugador = params.ID_Jugador
  onMount(async function() {
         const response = await fetch(apiURL+idJugador);
         let json  = await response.json();
         data = JSON.parse(json);
         console.log(data)
    });
  
  onMount(async function(){
        const response = await fetch(apiURL2);
        dataServidores  = await response.json();
        console.log(dataServidores)
  });  
  


  async function actualizarJugador() {
    const response= await fetch(apiURL3+idJugador,{
            method: 'PUT', 
            headers: {'Content-Type' : 'application/json'},
            body:JSON.stringify({
              "id_jugador": null,
              "id_servidor": selected,
              "nombre_jugador": nombreJugadorNuevo
            })
        });
    const json = await response.json()
    let result = JSON.stringify(json)
    console.log(result)
  }


  async function eliminarJugador() {
    const response= await fetch(apiURL4+idJugador,{
            method: 'DELETE'
        });
    const json = await response.json()
    let result = JSON.stringify(json)
    console.log(result)
  }

  async function crearJugador() {
    const response= await fetch(apiURLx,{
            method: 'POST', 
            headers: {'Content-Type' : 'application/json'},
            body:JSON.stringify({
              "id_jugador": null,
              "id_servidor": "OC1",
              "nombre_jugador": "SHANTI DE LA AUSTRALIO"
            })
        });
    const json = await response.json()
    let result = JSON.stringify(json)
    console.log(result)
  }
  


 
</script>

     
            
<svelte:head>
  <!--Import Google Icon Font-->
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <!--Import materialize.css-->
  <link type="text/css" rel="stylesheet" href="css/materialize.min.css"  media="screen,projection"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
  <!--Let browser know website is optimized for mobile  <h1>{JSON.stringify(dataServidores)} </h1>
-->
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</svelte:head>


<main>
  <body>
      <table class="highlight">
        <thead class="#7986cb indigo lighten-2">
          <tr>
            <th >id_jugador</th>
            <th >nombre_jugador</th>
            <th >id_servidor</th>
          </tr>
        </thead>
        <tbody class ="#c5cae9 indigo lighten-4">
          {#if data}
            <tr>
              <td>{data.id_jugador}</td>
              <td>{data.nombre_jugador}</td>
              <td>{data.id_servidor}</td>
            </tr>
          {/if}
        </tbody>
        <button class="btn waves-effect waves-light" type="submit" name="action" onclick="location.href='nuevapersona.php'" ><i class="material-icons right">AGREGAR PERSONA</i> </button>    
      </table>
  </body>        
</main>





<select  bind:value={selected} class="browser-default">
  <option value="" disabled selected>Choose your option</option>
  {#each dataServidores as servidor }
  <option value={servidor.id_servidor}>{servidor.region_servidor}</option>
  {/each}
</select>

<button on:click={()=> actualizarJugador()}>adasd</button>
<button on:click={()=> eliminarJugador()}>Eliminar</button>
<button on:click={()=> crearJugador()}>Crear</button>

<h1>{selected}</h1>