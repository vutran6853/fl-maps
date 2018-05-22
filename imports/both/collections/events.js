import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import possibleCategories from './events/helpers/possibleCategories.json'
import OneDaySchema from './events/OneDaySchema'
import SpecificPeriodSchema from './events/SpecificPeriodSchema'
import RecurringSchema from './events/RecurringSchema'

SimpleSchema.extendOptions(['uniforms'])

const Events = new Mongo.Collection('events')
const EventsSchema = new SimpleSchema({

  // Organiser
  'organiser': {
    type: Object,
    autoValue: () => {
      const { _id, profile } = Meteor.user() || { _id: '-', profile: { name: '-' } }
      return {
        _id,
        name: profile.name
      }
    }
  },
  'organiser._id': {
    type: String
  },
  'organiser.name': {
    type: String
  },

  // Categories
  'categories': {
    type: Array,
    custom: function () {
      if (!this.value) {
        return 'required'
      }

      if (!this.value[0]) {
        return 'required'
      }
    },
    uniforms: {
      customType: 'select',
      selectOptions: {
        multi: true,
        labelKey: 'name'
      },
      allowedValues: possibleCategories,
      label: 'Choose a Category',
      placeholder_: 'Pick your event\'s categories'
    }
  },
  'categories.$': {
    type: Object
  },
  'categories.$.name': {
    type: String,
    allowedValues: possibleCategories.reduce((arr, obj) => (arr.concat(obj.name)), [])
  },
  'categories.$.color': {
    type: String,
    allowedValues: possibleCategories.reduce((arr, obj) => (arr.concat(obj.color)), [])
  },

  // Details
  'name': {
    type: String,
    uniforms: {
      label: 'Name'
    }
  },
  'address': {
    type: Object,
    custom: function () {
      if (!this.value) {
        return 'required'
      }

      if (!this.value.name) {
        return 'required'
      }
    },
    uniforms: {
      customType: 'select',
      selectOptions: {
        'googleMaps': true
      },
      label: 'Select an address',
      placeholder_: 'Ex: New York, USA'
    }
  },
  'address.name': {
    type: String
  },
  'address.lat': {
    type: Number
  },
  'address.lng': {
    type: Number
  },
  'findHints': {
    type: String,
    max: 250,
    uniforms: {
      customType: 'textarea',
      label: 'How to find you?'
    }
  },

  // Date and Time
  'when': {
    type: Object
  },
  'when.type': {
    type: String,
    allowedValues: ['oneDay', 'specificPeriod', 'regularHours', 'recurring'],
    custom: function () {
      if (!this.value) {
        return 'required'
      }
    },
    autoValue: function () {
      if (!this.isSet) return
      // check if specificPeriod doesn't have date fields
      // if so, it is a regularHours

      if (this.value === 'specificPeriod') {
        const { startingDate, endingDate } = this.field('when.specificPeriod').value

        if (!startingDate || !endingDate) {
          return 'regularHours'
        }
      }
    }
  },
  'when.oneDay': {
    type: OneDaySchema,
    optional: true
  },
  'when.specificPeriod': { // is the same as regularHours
    type: SpecificPeriodSchema,
    optional: true
  },
  'when.recurring': {
    type: RecurringSchema,
    optional: true
  },

  // Description and More
  'overview': {
    type: String,
    max: 150,
    uniforms: {
      customType: 'textarea',
      label: 'Overview'
    }
  },
  'description': {
    type: String,
    max: 400,
    uniforms: {
      customType: 'textarea',
      label: 'Description'
    }
  },
  engagement: {
    type: Object,
    defaultValue: {}
  },
  'engagement.limit': {
    type: Number,
    min: 0,
    defaultValue: 0,
    uniforms: {
      customType: 'number',
      label: 'Attendee limit (leave empty if no limit)'
    }
  },
  'engagement.attendees': {
    type: Array,
    defaultValue: []
  },
  'engagement.attendees.$': {
    type: String,
    optional: true
  }
}, {
  clean: {
    filter: true,
    autoConvert: true,
    removeEmptyStrings: true,
    trimStrings: true,
    getAutoValues: true,
    removeNullsFromArrays: true
  }
})

Events.attachSchema(EventsSchema)

export {
  Events as default,
  EventsSchema
}
