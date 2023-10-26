const fcns = {
	"sin": Math.sin,
	"cos": Math.cos,
};

export default {
	props: ["initFcn"],
	emits: ["update:func"],
	data() {
		return {
			factor: 1,
			fcn: this.initFcn, // keyof typeof fcns
			theta: 1,
			offset: 0,
			fcnsKeys: Object.keys(fcns), // really const
		}
	},
	methods: {
		upd() {
			this.$emit("update:func", this.funcfunc);
		}
	},
	computed: {
		funcfunc() {
			return (x) => this.factor * (fcns[this.fcn](this.theta * x + this.offset));
		},
	},
	template: /*html*/`
		<p>
			<input v-model="factor" type="number" size="3" @input="upd" />
			<select v-model="fcn" id="fcn" @input="upd">
				<option v-for="fcn in fcnsKeys">{{fcn}}</option>
			</select>
			(
			<input v-model="theta" type="number" size="3" @input="upd" />
			θ +
			<input v-model="offset" type="number" size="3" @input="upd" />
			°)
		</p>
	`
}
