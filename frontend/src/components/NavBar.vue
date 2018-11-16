<template>
    <v-toolbar id="nav">
        <v-toolbar-items>
            <v-btn v-for="(navBarItem, key) in navBarItems" :key="key" :to="navBarItem.url" flat>
                {{ navBarItem.label }}
            </v-btn>
        </v-toolbar-items>
    </v-toolbar>
</template>

<script>
export default {
  name: "NavBar",
  props: {},
  methods: {},
  computed: {
    navBarItems() {
      return this.$store.state.navBarItems;
    }
  }
};
</script>