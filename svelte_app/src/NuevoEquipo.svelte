<script>
  const apiURLAddEquipo = "http://127.0.0.1:5000/add_equipo"

  let nombreEquipoNuevo = "";

  async function crearEquipo() {
    const response= await fetch(apiURLAddEquipo,{
            method: 'POST', 
            headers: {'Content-Type' : 'application/json'},
            body:JSON.stringify({
              "id_equipo": null,
              "nombre_equipo": nombreEquipoNuevo
            })
        });
    const json = await response.json()
    location.href = "/#/Equipos";
    //let result = JSON.stringify(json)
    //console.log(result)
  }   
</script>


<body style="background-image: url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)" >
  <div class="container" style ="padding-top: 10%">
    <div class = "container">
      <div class="col s12 m4 l8 card blue-grey lighten-5"> <!--La card entera-->

        <div class="card-content black-text" >  <!--El head de la card -->
          <span class="card-title center" style = "color: #263238 ;font-size: 2em;font-weight: bolder;">Nuevo Equipo</span>
        </div>

        <div class="card-action">  <!--El body de la card -->
          <div class ="container">
            <div class="row input-field">
              <input style="border-radius: 20px" bind:value={nombreEquipoNuevo} id="nombre_equipo" type="text" class="white validate black-text">
              <label class="active " for="nombre_equipo ">Nombre Equipo</label>
            </div>
          </div>
          
          <div class = "container">
            <button class ="waves-effect waves-light btn blue darken-1" on:click={()=> crearEquipo()}><i class="material-icons left">check_circle</i>Agregar</button>
          </div>

        </div>
      </div>
    </div>
  </div>
</body>






