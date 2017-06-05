var vizuly = {};
vizuly.version = "1.0", vizuly.viz = {}, vizuly.viz.create = function (a, b, c, d) {
    b.parent = a, b.selection = d3.select(a).append("div").style("width", "100%").style("height", "100%"), b.properties = c, b.id = vizuly.util.guid();
    var e = [];
    e.push("mouseover"), e.push("mouseout"), e.push("mousedown"), e.push("click"), e.push("touch"), e.push("zoom"), e.push("zoomstart"), e.push("zoomend"), e.push("initialize"), e.push("validate"), e.push("measure"), e.push("update"), Object.getOwnPropertyNames(c).forEach(function (a, b, c) {
        e.push(a + "_change")
    }), d && d.length > 0 && d.forEach(function (a) {
        e.push(a)
    }), b.dispatch = d3.dispatch.apply(this, e);
    var f = function () {
        return setProps(f, b, b.properties), f
    };
    return setProps = function (a, b, c) {
        Object.getOwnPropertyNames(c).forEach(function (d, e, f) {
            "undefined" == typeof b[d] && (b[d] = c[d], a[d] = function (c) {
                if (!arguments.length)return b[d];
                var e = b[d];
                return b[d] = c, b[d] !== e && b.dispatch[d + "_change"].apply(this, [b[d], e]), a
            })
        })
    }, f.id = function () {
        return b.id
    }, f.selection = function () {
        return b.selection
    }, f.on = function (a, c) {
        return b.dispatch.on(a, c), f
    }, f.validate = function () {
        if (!a) {
            var a = [];
            if (Object.getOwnPropertyNames(c).forEach(function (c) {
                    !b[c] && Number(0 != b[c]) && a.push(c)
                }), a.length > 0)throw new Error("vizuly.util.viz.validate(): " + a.concat() + " need to be declared");
            b.dispatch.validate()
        }
    }, f()
}, vizuly.util = {}, vizuly.util.size = function (a, b, c) {
    return size = {}, size.width = b - vizuly.util.measure(a.left, b) - vizuly.util.measure(a.right, b), size.height = c - vizuly.util.measure(a.top, c) - vizuly.util.measure(a.bottom, c), size.top = vizuly.util.measure(a.top, c), size.left = vizuly.util.measure(a.left, b), size
}, vizuly.util.getTypedScale = function (a) {
    var b;
    return b = "string" == typeof a ? d3.scale.ordinal() : a instanceof Date ? d3.time.scale() : d3.scale.linear()
}, vizuly.util.setRange = function (a, b, c) {
    "string" == typeof a.domain()[0] ? a.rangeBands([b, c], 0) : a.range([b, c])
}, vizuly.util.measure = function (a, b) {
    if ("string" == typeof a && "%" == a.substr(a.length - 1)) {
        var c = Math.min(Number(a.substr(0, a.length - 1)), 100) / 100;
        return Math.round(b * c)
    }
    return a
}, vizuly.util.guid = function () {
    return "vzxxxxxxxx".replace(/[xy]/g, function (a) {
        var b = 16 * Math.random() | 0, c = "x" === a ? b : 3 & b | 8;
        return c.toString(16)
    })
}, vizuly.util.getDefs = function (a) {
    return defs = a.selection().selectAll("svg defs"), defs[0].length < 1 && (defs = a.selection().select("svg").append("defs")), defs
}, vizuly.color = {}, vizuly.color.shift = function (a, b) {
    return a = "0x" + a.replace("#", ""), a = parseInt(a, 16), a += 65793, a |= b, "#" + a.toString(16)
}, vizuly.format = {}, vizuly.format.YEAR_Mon_MonDay = d3.time.format.multi([[".%L", function (a) {
    return a.getMilliseconds()
}], [":%S", function (a) {
    return a.getSeconds()
}], ["%I:%M", function (a) {
    return a.getMinutes()
}], ["%I %p", function (a) {
    return a.getHours()
}], ["%a %d", function (a) {
    return a.getDay() && 1 != a.getDate()
}], ["%b %d", function (a) {
    return 1 != a.getDate()
}], ["%b", function (a) {
    return a.getMonth()
}], ["20%y", function (a) {
    return !0
}]]), vizuly.component = {}, vizuly.component.layout = {}, vizuly.component.layout.CLUSTERED = "CLUSTERED", vizuly.component.layout.STACKED = "STACKED", vizuly.component.layout.OVERLAP = "OVERLAP", vizuly.component.layout.STREAM = "STREAM", vizuly.component.radial_progress = function (a) {
    function o() {
        i = b.selection.append("svg").attr("id", b.id).style("overflow", "visible").attr("class", "vizuly"), m = vizuly.util.getDefs(d), j = i.append("g").attr("class", "vz-radial_progress-viz"), k = j.append("g").attr("class", "vz-radial_progress-plot").attr("clip-path", "url(#" + b.id + "_plotClipPath)"), l = k.append("g").attr("class", "vz-radial_progress-arc-plot"), b.dispatch.initialize()
    }

    function p() {
        d.validate(), e = vizuly.util.size(b.margin, b.width, b.height), f = b.startAngle == b.endAngle ? 360 : b.startAngle > b.endAngle ? 360 - (b.startAngle - b.endAngle) : f = b.endAngle - b.startAngle;
        var a = b.startAngle * g, c = Math.floor(b.data / (b.max - b.min)) + 1, i = Math.min(b.radius * b.arcThickness, .75 * b.radius / c);
        h     = [];
        for (var j = 0; j < c; j++) {
            var k = {}, l = d3.svg.arc();
            l.outerRadius(b.radius - i * j), l.innerRadius(b.radius - i * (j + 1)), l.cornerRadius(i * b.capRadius / 2), k.arc = l, k.startAngle = a;
            var m = b.data / (b.max - b.min) - j;
            k.endAngle = m > 1 ? f * g + a : m * f * g + a, h.push(k)
        }
        n.outerRadius(b.radius).cornerRadius(i * b.capRadius / 2).innerRadius(b.radius - i * h.length).startAngle(b.startAngle * g).endAngle((b.startAngle + f) * g), b.dispatch.measure()
    }

    function q() {
        p(), i.attr("width", b.width).attr("height", b.height), k.style("width", e.width).style("height", e.height).attr("transform", "translate(" + e.left + "," + e.top + ")"), l.attr("transform", "translate(" + e.width / 2 + "," + e.height / 2 + ")");
        var a = k.selectAll(".vz-radial_progress-back-circle");
        0 == a[0].length && (a = l.append("circle").attr("class", "vz-radial_progress-back-circle")), a.attr("r", b.radius);
        var c = k.selectAll(".vz-radial_progress-track");
        0 == c[0].length && (c = l.append("path").attr("class", "vz-radial_progress-track")), c.attr("d", n);
        var d = l.selectAll(".vz-radial_progress-arc").data(h);
        d.enter().append("path").attr("class", "vz-radial_progress-arc"), d.exit().remove(), d.transition().duration(b.duration).call(r), b.dispatch.update()
    }

    function r(a) {
        a.attrTween("d", function (a) {
            var c = d3.interpolate(a.startAngle, a.endAngle);
            return function (e) {
                return a.endAngle = c(e), b.dispatch.tween(d, e), a.arc(a)
            }
        })
    }

    var b                      = {}, c = {
        data:         null,
        margin:       {
            top:    "10%",
            bottom: "7%",
            left:   "8%",
            right:  "7%"
        },
        duration:     500,
        width:        300,
        height:       300,
        radius:       150,
        min:          0,
        max:          1,
        capRadius:    0,
        startAngle:   180,
        endAngle:     180,
        arcThickness: .05
    }, d                       = vizuly.viz.create(a, b, c, ["tween"]);
    d.type                     = "viz.chart.radial_progress";
    var e, f, i, j, k, l, m, g = Math.PI / 180, h = [], n = d3.svg.arc();
    return o(), d.update = function () {
        return q(), d
    }, d
};