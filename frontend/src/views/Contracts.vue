<template>
  <div class="contracts">
    <v-container>
        <v-layout>
            <v-flex xs8>
                <div class="col-content">

                </div>
            </v-flex>
            <v-flex xs4>
                <div class="col-content">
                    <v-card>
                        <v-tabs color="grey lighten-3" slider-color="red accent-4">
                            <v-tab :key="search" ripple>Search</v-tab>
                            <v-tab :key="savedViews" ripple>Saved Views</v-tab>
                            <v-tab-item :key="search">
                                <v-card-text>
                                    <v-form>
                                        <v-layout>
                                            <v-flex xs12>
                                                <v-text-field 
                                                    label="Company Name"
                                                >
                                                </v-text-field>
                                            </v-flex>    
                                        </v-layout>
                                        <v-layout>
                                            <v-flex xs6>
                                                <v-checkbox 
                                                    label="Valid Contract"
                                                >
                                                </v-checkbox>
                                            </v-flex>
                                            <v-flex xs6>
                                                <v-checkbox 
                                                    label="Expired Contract"
                                                >
                                                </v-checkbox>
                                            </v-flex>  
                                        </v-layout> 
                                        <v-layout>
                                            <v-flex>
                                                <v-checkbox 
                                                label="Last Contract"
                                                >
                                                </v-checkbox>
                                            </v-flex>
                                        </v-layout>
                                        <v-layout>
                                            <v-flex xs6>
                                                <v-text-field 
                                                    label="Beginning Interval Start"
                                                    v-model="formatted"
                                                >
                                                </v-text-field>
                                            </v-flex>
                                            <v-flex xs6>
                                                <v-text-field 
                                                    label="Beginning Interval End"
                                                    v-model="formatted"
                                                >
                                                </v-text-field>
                                            </v-flex>  
                                        </v-layout> 
                                        <v-layout>
                                            <v-flex xs6>
                                                <v-text-field 
                                                    label="Expiry Interval Start"
                                                    v-model="formatted"
                                                >
                                                </v-text-field>
                                            </v-flex>
                                            <v-flex xs6>
                                                <v-text-field 
                                                    label="Expiry Interval End"
                                                    v-model="formatted"
                                                >
                                                </v-text-field>
                                            </v-flex>  
                                        </v-layout>
                                        <!--
                                        <v-date-picker 
                                            no-title 
                                            v-model="picker" 
                                            :date-format="date => new Date(date).toDateString()" 
                                            :formatted-value.sync="formatted"
                                        >
                                        </v-date-picker>
                                        -->
                                    </v-form>
                                </v-card-text>
                            </v-tab-item>   
                            <v-tab-item :key="savedViews">
                                2
                            </v-tab-item>  
                        </v-tabs>
                        <v-card-title> 
                        </v-card-title>
                        <v-card-text>
                        </v-card-text>
                    </v-card>
                </div>
            </v-flex>
        </v-layout>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "contracts",
  data: () => {
    return {
      picker: "",
      formatted: ""
    };
  },
  components: {}
};
</script>

<style>
.container {
  max-width: 1728px;
}
.col-content {
  margin: 0 auto;
  width: 95%;
}
</style>