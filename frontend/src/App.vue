<template>
  <div id="app">
    <v-toolbar>
      <v-toolbar-items>
        <v-btn flat>Companies</v-btn>
        <v-btn flat>Mailing</v-btn>
        <v-btn flat>Invoices</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /*margin-top: 60px;*/
}
</style>
