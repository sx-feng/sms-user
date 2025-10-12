<template>
<LoginPage/>
<DashBoard/>
</template>

<script>
import DashBoard from './pages/DashBoard.vue';
import LoginPage from './pages/LoginPage.vue';



export default {
  name: 'App',
  components: {
 LoginPage,
 DashBoard
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
