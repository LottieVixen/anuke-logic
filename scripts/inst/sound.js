// Play a game sound at the speaker
// Cooldown is 0.5s for speaker
// sound speaker1 "pew"

/* Speaker interface: {
	Sound getSound(String name);
	void playSound(Sound sound, float pitch);
} */

const SoundI = {
	_(builder, block, sound, pitch) {
		this.block = builder.var(block);
		this.sound = builder.var(sound);
		this.pitch = builder.var(pitch);
	},

	run(vm) {
		if (Vars.headless) return;

		const speaker = vm.building(this.block);
		if (!speaker || !speaker.getSound) return;
		if (speaker.team != vm.team || !vm.linkIds.contains(speaker.id)) return;

		const sound = speaker.getSound(vm.obj(this.sound));
		if (!sound) return;

		const pitch = vm.num(this.pitch);
		speaker.playSound(sound, pitch);
	},

	getIndex(vm, str) {
		// see LAssembler#var
		str = str.replace(/ /g, "_");

		const vars = this.builder.vars;
		if (vars.containsKey(str)) {
			return vars.get(str).id;
		}

		// Don't add new variables, require declaring them first
		return -1;
	}
};

const SoundStatement = {
	new: words => {
		const st = extend(LStatement, Object.create(SoundStatement));
		st.read(words);
		return st;
	},

	read(words) {
		this.speaker = words[1] || "speaker1";
		this.sound = words[2] || '"pew"';
		this.pitch = words[3] || "1";
	},

	build(h) {
		if (h instanceof Table) {
			return this.buildt(h);
		}

		const inst = extend(LExecutor.LInstruction, Object.create(SoundI));
		inst._(h, this.speaker, this.sound, this.pitch);
		return inst;
	},

	buildt(table) {
		const add = name => {
			table.add(name).left().marginLeft(10);
			return this.field(table, this[name], text => {this[name] = text}).get();
		};

		add("speaker");
		this.row(table);
		const soundf = add("sound");

		const b = new Button(Styles.logict);
		b.image(Icon.pencilSmall);

		b.clicked(() => this.showSelectTable(b, (t, hide) => {
			const list = new Table();
			for (var i in Sounds) {
				if (!(Sounds[i] instanceof Sound)) {
					continue;
				}

				// Closure needed because apparently a loop means redeclaration
				(() => {
					var name = i;
					list.button(name, () => {
						name = '"' + name + '"';
						this.sound = name;
						soundf.text = name;
						hide.run();
					}).size(240, 40).row();
				})();
			}
			t.add(list).width(240).left();
		}));
		table.add(b).size(40).padLeft(-1).color(table.color);

		this.row(table);
		add("pitch");
	},

	write(b) {
		b.append("sound ");
		b.append(this.speaker);
		b.append(" ");
		b.append(this.sound);
		b.append(" ");
		b.append(this.pitch);
	},

	name: () => "Sound",
	color: () => Pal.logicBlocks
};

/* Mimic @RegisterStatement */
LAssembler.customParsers.put("sound", func(SoundStatement.new));

LogicIO.allStatements.add(prov(() => SoundStatement.new([
	"sound",
	"speaker1",
	'"pew"'
])));

module.exports = SoundStatement;
