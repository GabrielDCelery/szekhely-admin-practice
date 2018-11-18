<template>
  <div class="contracts">
    <v-container>
        <v-layout>
            <v-flex xs9>
                <div class="col-content">
                    <v-data-table
                        :headers="dataTable.headers"
                        :items="dataTable.contracts"
                    >
                        <template slot="items" slot-scope="props">
                            <td class="text-xs-left">{{ props.item.name }}</td>
                            <td class="text-xs-left">{{ props.item.type }}</td>
                        </template>
                    </v-data-table>
                </div>
            </v-flex>
            <v-flex xs3>
                <div class="col-content">
                        <v-tabs color="grey lighten-3" slider-color="red accent-4">
                            <v-tab :key="'search'" ripple>Search</v-tab>
                            <v-tab :key="'savedViews'" ripple>Saved Views</v-tab>
                            <v-tab-item :key="'search'">
                                <v-form>
                                    <v-expansion-panel>
                                        <v-expansion-panel-content>
                                            <div slot="header">Company Details</div>
                                            <v-card>
                                                <v-card-text>
                                                    <v-layout>
                                                        <v-flex xs12>
                                                            <v-text-field 
                                                                label="Company Name"
                                                            >
                                                            </v-text-field>
                                                        </v-flex>
                                                    </v-layout>
                                                    <v-layout>
                                                        <v-flex xs12>
                                                            <v-text-field 
                                                                label="Manager Name"
                                                            >
                                                            </v-text-field>
                                                        </v-flex>
                                                    </v-layout>
                                                </v-card-text>
                                            </v-card>
                                        </v-expansion-panel-content>
                                    </v-expansion-panel>
                                    <v-expansion-panel>
                                        <v-expansion-panel-content>
                                            <div slot="header">Contract Details</div>
                                            <v-card>
                                                <v-card-text>
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
                                                </v-card-text>
                                            </v-card>
                                        </v-expansion-panel-content>
                                    </v-expansion-panel>
                                    <v-expansion-panel>
                                        <v-expansion-panel-content>
                                            <div slot="header">Services</div>
                                            <v-card>
                                                <v-card-text>
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
                                                </v-card-text>
                                            </v-card>
                                        </v-expansion-panel-content>
                                    </v-expansion-panel>
                                </v-form>
                                <v-card-actions>
                                    <v-btn color="success">Search</v-btn>
                                </v-card-actions>
                            </v-tab-item>   
                            <v-tab-item :key="'savedViews'">
                                2
                            </v-tab-item>  
                        </v-tabs>

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
      dataTable: {
        headers: [
          {
            text: "Company Name",
            align: "left",
            value: "name"
          },
          {
            text: "Company Type",
            align: "left",
            value: "type"
          }
        ],
        contracts: [
          {
            name: "100 SZÁL VIRÁG",
            type: "Kft."
          },
          {
            name: "13Almafa",
            type: "Bt."
          }
        ]
      },
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