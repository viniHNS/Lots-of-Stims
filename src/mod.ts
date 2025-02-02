/* eslint-disable @typescript-eslint/naming-convention */
import { DependencyContainer } from "tsyringe";

import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { ILogger }        from "@spt/models/spt/utils/ILogger";
import { LogTextColor }   from "@spt/models/spt/logging/LogTextColor";

import { Traders }     from "@spt/models/enums/Traders";
import { Money }       from "@spt/models/enums/Money";
import { ItemTpl }     from "@spt/models/enums/ItemTpl";
import { BaseClasses } from "@spt/models/enums/BaseClasses";

import { ItemHelper } from "@spt/helpers/ItemHelper";

import { FluentAssortConstructor as FluentAssortCreator } from "./fluentTraderAssortCreator";

import { HashUtil }       from "@spt/utils/HashUtil";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";

import { CustomItemService }       from "@spt/services/mod/CustomItemService";
import { IDatabaseTables }         from "@spt/models/spt/server/IDatabaseTables";
import { NewItemFromCloneDetails } from "@spt/models/spt/mod/NewItemDetails";

import config from "../config/config.json";

import sj18  from "../buffs/sj18.json";
import pnl17 from "../buffs/pnl17.json";
import pchx  from "../buffs/pchx.json";
import vnk11 from "../buffs/vnk11.json";

// -----------------------------
class Mod implements IPostDBLoadMod, IPreSptLoadMod 
{
    private mod: string;
    private logger: ILogger;
    private fluentAssortCreator: FluentAssortCreator;

    constructor() 
    {
        this.mod = "Lots of Stims"; // Set name of mod so we can log it to console later
    }

    public preSptLoad(container: DependencyContainer): void 
    {
    // Get SPT code/data we need later
        const hashUtil: HashUtil = container.resolve<HashUtil>("HashUtil");
        this.logger = container.resolve<ILogger>("WinstonLogger");
        this.fluentAssortCreator = new FluentAssortCreator(hashUtil, this.logger);
        this.logger.logWithColor("[ViniHNS] Lots of Stims loading!", LogTextColor.GREEN);
    }

    public postDBLoad(container: DependencyContainer): void 
    {
    // get database from server
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");

        // Resolve the CustomItemService container
        const CustomItem = container.resolve<CustomItemService>("CustomItemService");

        // Resolve the ItemHelper container
        const itemHelper = container.resolve<ItemHelper>("ItemHelper");

        // Get all the in-memory json found in /assets/database
        const tables: IDatabaseTables = databaseServer.getTables();

        
        /*  IEffectsDamage {
                Pain:
                LightBleeding:
                HeavyBleeding:
                Contusion:
                RadExposure:
                Fracture:
                DestroyedPart:
            }
        */

        function createStim(
            itemTplToClone: string = "5ed5166ad380ab312177c100",
            weight: any,
            newId: string,
            fleaPriceRoubles: number,
            buff: string,
            handbookPriceRoubles: number,
            handbookParentId: string,
            locales_name: string,
            locales_shortName: string,
            locales_description: string
        ): void 
        {
            const ExampleCloneItem: NewItemFromCloneDetails = {
                itemTplToClone: itemTplToClone,
                overrideProperties: {
                    Weight: weight,
                    StimulatorBuffs: buff,
                    effects_damage: {},
                    effects_health: []
                }, //Overried properties basically tell the server on what data inside _props to be modified from the cloned item, in this example i am modifying the ammo used to be 12G
                parentId: "5448f3a64bdc2d60728b456a", //ParentId refers to the Node item the gun will be under, you can check it in https://db.sp-tarkov.com/search
                newId: newId, //The new id of our cloned item
                fleaPriceRoubles: fleaPriceRoubles, //Self explanatary
                handbookPriceRoubles: handbookPriceRoubles,
                handbookParentId: handbookParentId, //Handbook Parent Id refers to the category the gun will be under
                //you see those side box tab thing that only select gun under specific icon? Handbook parent can be found in Aki_Data\Server\database\templates.
                locales: {
                    en: {
                        name: locales_name,
                        shortName: locales_shortName,
                        description: locales_description
                    }

                }

            };

            CustomItem.createItemFromClone(ExampleCloneItem); //Basically calls the function and tell the server to add our Cloned new item into the server
        }

        // ---------------------------------------------------
        // Create the stim buffs
        const buffs = tables.globals.config.Health.Effects.Stimulator.Buffs;
        

        buffs["BuffsSJ18TGLabs"] = sj18;
        buffs["BuffsPNL17"] = pnl17;
        buffs["BuffsPCHX"] = pchx;
        buffs["BuffsVNK11"] = vnk11;

        createStim(
            "5c0e531286f7747fa54205c2",
            0.1,
            "678bff0962756d2aaf75dfb1",
            35000,
            "BuffsSJ18TGLabs",
            35000,
            "5448f3a64bdc2d60728b456a",
            "SJ18 TGLabs combat stimulant injector",
            "SJ18",
            "An experimental stimulant designed to enhance endurance. Comes with unusual side effects, like bleeding"
        );

        createStim(
            "5fca138c2a7b221b2852a5c6", 
            0.09, 
            "678c0fe60e412b43e3325e82", 
            60000, 
            "BuffsPNL17", 
            60000, 
            "5448f3a64bdc2d60728b456a", 
            "PNL (Product 17) stimulant injector", 
            "PNL17", 
            "Derived from PNB research, this stimulant accelerates metabolism to boost adrenaline for extreme situations, with a risk of severe dehydration, and legs destruction"
        );

        createStim(
            "5ed51652f6c34d2cc26336a1", 
            0.08, 
            "678e8c0b146703008d8f40f6", 
            90000, 
            "BuffsPCHX", 
            90000, 
            "5448f3a64bdc2d60728b456a", 
            "PCH-X (Pain Control Hybrid) stimulant injector", 
            "PCH-X", 
            "A hybrid mixture for enhanced focus and pain reduction during extended missions. Side effects include reduced auditory perception and thirst"
        );

        tables.templates.items["678e8c0b146703008d8f40f6"]._props.effects_damage = { 
            "Contusion": {
                "delay": 0,
                "duration": 300,
                "fadeOut": 0
            },
            "Pain": {
                "delay": 0,
                "duration": 300,
                "fadeOut": 5
            }
    
        }

        createStim(
            "5ed5166ad380ab312177c100", 
            0.07, 
            "678e99cd6d02d098f43a1bc1", 
            100000, 
            "BuffsVNK11", 
            100000, 
            "5448f3a64bdc2d60728b456a", 
            "VNK-11 stimulant injector", 
            "VNK-11", 
            "A clandestine stimulant that alleviates extreme exhaustion. Prolonged use increases the risk of severe internal bleeding and make the user unable to run "
        )


        // Add SJ18 TGLabs combat stimulant injector to Therapist LL2
        this.fluentAssortCreator
            .createSingleAssortItem("678bff0962756d2aaf75dfb1")
            .addStackCount(5)
            .addBarterCost(ItemTpl.STIM_L1_NOREPINEPHRINE_INJECTOR, 2)
            .addLoyaltyLevel(2)
            .export(tables.traders[Traders.THERAPIST]);

        // Add PNL (Product 17) stimulant injector to Skier LL2
        this.fluentAssortCreator
            .createSingleAssortItem("678c0fe60e412b43e3325e82")
            .addStackCount(2)
            .addBarterCost(ItemTpl.STIM_OBDOLBOS_COCKTAIL_INJECTOR, 2)
            .addLoyaltyLevel(2)
            .export(tables.traders[Traders.SKIER]);

        // Add PCH-X (Pain Control Hybrid) stimulant injector to Therapist LL2
        this.fluentAssortCreator
            .createSingleAssortItem("678e8c0b146703008d8f40f6")
            .addStackCount(2)
            .addBarterCost(ItemTpl.STIM_ADRENALINE_INJECTOR, 1)
            .addBarterCost(ItemTpl.DRUGS_MORPHINE_INJECTOR, 1)
            .addLoyaltyLevel(2)
            .export(tables.traders[Traders.THERAPIST]);

        // Add VNK-11 stimulant injector to Skier LL3
        this.fluentAssortCreator
            .createSingleAssortItem("678e99cd6d02d098f43a1bc1")
            .addStackCount(2)
            .addBarterCost(ItemTpl.STIM_OBDOLBOS_COCKTAIL_INJECTOR, 1)
            .addBarterCost(ItemTpl.DRINK_BOTTLE_OF_PEVKO_LIGHT_BEER, 1)
            .addLoyaltyLevel(3)
            .export(tables.traders[Traders.SKIER]);

        if(config.debug){
            // For testing purposes
            // Add SJ18 TGLabs combat stimulant injector to Therapist LL2
            this.fluentAssortCreator
                .createSingleAssortItem("678bff0962756d2aaf75dfb1")
                .addStackCount(1234)
                .addMoneyCost(Money.ROUBLES, 1)
                .addLoyaltyLevel(1)
                .export(tables.traders[Traders.THERAPIST]);

            // Add PNL (Product 17) stimulant injector to Skier LL2
            this.fluentAssortCreator
                .createSingleAssortItem("678c0fe60e412b43e3325e82")
                .addStackCount(1234)
                .addMoneyCost(Money.ROUBLES, 1)
                .addLoyaltyLevel(1)
                .export(tables.traders[Traders.SKIER]);

            // Add PCH-X (Pain Control Hybrid) stimulant injector to Therapist LL2
            this.fluentAssortCreator
                .createSingleAssortItem("678e8c0b146703008d8f40f6")
                .addStackCount(1234)
                .addMoneyCost(Money.ROUBLES, 1)
                .addLoyaltyLevel(1)
                .export(tables.traders[Traders.THERAPIST]);

            // Add VNK-11 stimulant injector to Skier LL3
            this.fluentAssortCreator
                .createSingleAssortItem("678e99cd6d02d098f43a1bc1")
                .addStackCount(1234)
                .addMoneyCost(Money.ROUBLES, 1)
                .addLoyaltyLevel(1)
                .export(tables.traders[Traders.SKIER]);
        }

        const item = Object.values(tables.templates.items);
        const allStims = item.filter(x => itemHelper.isOfBaseclass(x._id, BaseClasses.STIMULATOR));

        for(const stim of allStims){
            stim._props.MaxHpResource = config.stimUses;
        }

        this.logger.logWithColor(
            `[ViniHNS] ${this.mod} - Database Loaded`,
            LogTextColor.GREEN
        );

    }

}

export const mod = new Mod();
