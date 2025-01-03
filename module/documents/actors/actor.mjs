import { FU } from "../../helpers/config.mjs";

/**
 * Extend basic Actor
 * @extends {Actor}
 */

export class FabulaActor extends Actor {

	overrides = this.overrides ?? {};

	/**
	 * Augment basic Actor data model
	 */
	prepareData() {
		super.prepareData();
	}

	prepareBaseData() {
	}

	prepareDerivedData() {
		super.prepareDerivedData();
		const actorData = this;
		const systemData = actorData.system;
		const flags = actorData.flags.boilerplate || {};
		
		this.items.forEach((item) => item.applyActiveEffects());
	
		this._prepareCharacterData(actorData);
		this._prepareNpcData(actorData);
	}

	_prepareCharacterData(actorData) {
		if (actorData.type !== 'character') return;
	  
		const systemData = actorData.system;
	}

	_prepareNpcData(actorData) {
		if (actorData.type !== 'npc') return;
	  
		const systemData = actorData.system;
		systemData.specialRules = systemData.specialRules || [];
	}

	*allApplicableEffects() {
		for ( const effect of super.allApplicableEffects() ) {
			const item = effect.parent;

			if ( item instanceof FabulaActor ) {
				if ( item.system.transferEffects instanceof Function ? item.system.transferEffects() : true ) {
					yield effect;
				}
			} else {
				yield effect;
			}
		}
	}

	applyActiveEffects() {
		if (this.system.prepareEmbeddedData instanceof Function) {
			this.system.prepareEmbeddedData();
		}
		return super.applyActiveEffects();
	}

	async _onCreate( data, options, userId ) {
		await super._onCreate( data, options, userId );

		// Check if Unarmed Strike is equipped to the Actor
		if ( this.type == 'character' || this.type == 'npc' ) {
			if ( FU.UnarmedStrike ) {
				const embeddedItem = this.items.find( item => item.name == FU.UnarmedStrike.name );

				if ( !embeddedItem ) {
					const createdItem = await this.createEmbeddedDocuments( 'Item', [FU.UnarmedStrike] );
					if ( this.type == 'character' )
					await createdItem[0].update({ 'system.isEquipped': true });
					await this.update({
						'system.equip.mainHand': createdItem[0]._id,
						'system.equip.offHand': createdItem[0]._id,
					});
				}
			}
		}
	}

	getRollData() {
		const data = super.getRollData();
	  
		this._getCharacterRollData(data);
		this._getNpcRollData(data);
	  
		return data;
	}

	_getCharacterRollData(data) {
		if (this.type !== 'character') return;
	}
	  
	_getNpcRollData(data) {
		if (this.type !== 'npc') return;
	}

	async fullRest() {
		this.update({ 'system.resources.hp.current': this.system.resources.hp.max });
		this.update({ 'system.resources.mp.current': this.system.resources.mp.max });
		this.update({ 'system.status.slow.active': false });
		this.update({ 'system.status.dazed.active': false });
		this.update({ 'system.status.weak.active': false });
		this.update({ 'system.status.shaken.active': false });
		this.update({ 'system.status.enraged.active': false });
		this.update({ 'system.status.poisoned.active': false });
	}

}